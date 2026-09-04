
// // ============================================================
// // UploadPage — THE SENDER'S VIEW (3 windows, like the PDF)
// //
// // WORDING RULE: this page talks to NORMAL people.
// //   - We say "cryptography", not "AES-GCM".
// //   - We say "link that deletes itself", not "auto-expiring link".
// //   - The technical names live on the How it works page instead.
// //
// // LAYOUT RULE: on laptops the options and link windows grow wider
// // (maw 880) so all pages feel the same width. On phones they stay
// // at 640 and stack, exactly as before.
// //
// // FLOW:
// //   "drop"    → FileDropzone + hero text (simple tooltips)
// //               + 3 quiet facts + one trust banner
// //   "options" → UploadOptions (file row, limits, encryption, password)
// //               + live progress panel (blue, thin) + failure banner
// //   "link"    → ShareLinkCard (link + password copy + status + stars)
// //
// // Heavy logic (encryption, presigned URLs) stays in src/lib/* untouched.
// // ============================================================
// import { useCallback, useEffect, useRef, useState } from "react";
// import toast from "react-hot-toast";
// import { Box, Card, Container, Group, Loader, Paper, Progress, SimpleGrid, Stack, Text, Title } from "@mantine/core";
// import { Clock, Download, HardDrive } from "lucide-react";
// import { FileDropzone } from "../components/FileDropzone";
// import { UploadOptions } from "../components/upload/UploadOptions";
// import { ShareLinkCard } from "../components/upload/ShareLinkCard";
// import { InfoBanner } from "../components/InfoBanner";
// import { Term } from "../components/Term";
// import { requestUploadUrl, uploadFileToS3WithProgress } from "../lib/api";
// import { encryptFile } from "../lib/crypto";

// const EXPIRY_SECONDS = 24 * 60 * 60; // 1 day ONLY
// const MAX_DOWNLOADS = 10;

// // Human readable file size for the options window
// function formatBytes(bytes: number): string {
//   if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
//   if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
//   if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${bytes} B`;
// }

// // SHA-256 of the password = the verifier the backend stores (NOT the key)
// async function hashPassword(password: string): Promise<string> {
//   const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
//   return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
// }

// function UploadPage() {
//   const [step, setStep] = useState<"drop" | "options" | "link">("drop");
//   const [file, setFile] = useState<File | null>(null);
//   const [isEncrypted, setIsEncrypted] = useState(true);
//   const [password, setPassword] = useState("");
//   const [maxDownloads, setMaxDownloads] = useState(10);
//   const [acceptedTerms, setAcceptedTerms] = useState(false);

//   const [isWorking, setIsWorking] = useState(false);
//   const [stage, setStage] = useState<"encrypting" | "uploading">("encrypting");
//   const [progress, setProgress] = useState(0);
//   const [slowNote, setSlowNote] = useState(false);
//   const [failed, setFailed] = useState<string | null>(null);
//   const startRef = useRef(0);

//   const [shareUrl, setShareUrl] = useState<string | null>(null);
//   const [copied, setCopied] = useState(false);
//   const [createdAt, setCreatedAt] = useState<number | null>(null);
//   const [timeLeft, setTimeLeft] = useState("24h 0m 0s");

//   // Live countdown shown in the status strip once the link exists
//   useEffect(() => {
//     if (!createdAt) return;
//     const interval = window.setInterval(() => {
//       const diff = Math.max(0, createdAt + EXPIRY_SECONDS * 1000 - Date.now());
//       const h = Math.floor(diff / 3600000);
//       const m = Math.floor((diff % 3600000) / 60000);
//       const s = Math.floor((diff % 60000) / 1000);
//       setTimeLeft(`${h}h ${m}m ${s}s`);
//     }, 1000);
//     return () => window.clearInterval(interval);
//   }, [createdAt]);

//   // Dropzone hands us the file, we move to the options window
//   const handleFileSelect = useCallback((f: File) => {
//     setFile(f); setStep("options"); setFailed(null);
//     toast.success(`Selected: ${f.name}`, { duration: 2500 });
//   }, []);

//   // encrypt, register, PUT bytes to S3 (with progress + offline abort)
//   const handleUpload = async () => {
//     if (!file) return toast.error("Please select a file.");
//     if (isEncrypted && password.length < 8) return toast.error("Password needs at least 8 characters.");
//     if (!acceptedTerms) return toast.error("Please accept the Terms & Privacy Policy.");
//     if (!navigator.onLine) { setFailed("You're offline. Check your internet, then press Upload again."); return; }

//     setFailed(null); setSlowNote(false); setProgress(0); setIsWorking(true); setStage("encrypting");
//     const controller = new AbortController();
//     const goOffline = () => controller.abort();
//     window.addEventListener("offline", goOffline);

//     try {
//       let fileToUpload: File | Blob = file;
//       let salt: string | null = null;
//       let iv: string | null = null;

//       if (isEncrypted) {
//         const enc = await encryptFile(file, password);
//         fileToUpload = enc.encryptedFile; salt = enc.salt; iv = enc.iv;
//       }

//       setStage("uploading");
//       startRef.current = Date.now();
//       const metadata = {
//         originalName: file.name,
//         mimeType: isEncrypted ? "application/octet-stream" : file.type,
//         sizeBytes: fileToUpload.size,
//         isEncrypted,
//         passwordHash: isEncrypted ? await hashPassword(password) : null,
//         iv, salt,
//         expirySeconds: EXPIRY_SECONDS,
//         maxDownloads,
//       };
//       const res = await requestUploadUrl(metadata);
//       const { presignedUrl, shareUrl: newShareUrl } = res.data;

//       await uploadFileToS3WithProgress(presignedUrl, fileToUpload as File, {
//         signal: controller.signal,
//         onProgress: (p) => {
//           setProgress(p);
//           if (Date.now() - startRef.current > 6000 && p < 90) setSlowNote(true);
//         },
//         onStall: () => setSlowNote(true),
//       });

//       setShareUrl(newShareUrl); setCreatedAt(Date.now()); setStep("link");
//       toast.success("Upload complete");
//     } catch (err) {
//       const base = !navigator.onLine
//         ? "Your internet dropped during the upload."
//         : err instanceof Error ? err.message : "Upload failed.";
//       setFailed(`${base} Don't worry, your file never left your device. Press Upload to try again.`);
//     } finally {
//       window.removeEventListener("offline", goOffline);
//       setIsWorking(false);
//     }
//   };

//   // Copy whatever link the card hands us (plain or #embedded)
//   const handleCopy = (url: string) => {
//     navigator.clipboard.writeText(url);
//     setCopied(true);
//     toast.success("Link copied", { duration: 2000 });
//   };

//   // Back to the drop window, clear everything
//   const reset = () => {
//     setStep("drop"); setFile(null); setPassword("");
//     setShareUrl(null); setCopied(false); setCreatedAt(null); setFailed(null);
//   };

//   return (
//     <Container size="xl" py={{ base: "md", sm: "xl" }}>
//       {/* ---------- WINDOW 1: drop + simple explanation ---------- */}
//       {step === "drop" && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
//           <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
//             <FileDropzone onFileSelect={handleFileSelect} />
//             <Stack justify="center" gap="md">
//               <Title order={2}>Simple, private file sharing</Title>
//               {/* SIMPLE words for normal people. Hover or tap the dotted
//                   words to see a plain explanation. */}
//                         <Text c="dimmed" fz="sm" lh={1.8}>
//                 VaultHub lets you share files with{" "}
//                 <Term tip="Cryptography means your file is scrambled into a secret code on your device before upload. Only the right password can unscramble it. Even we cannot read it.">
//                   cryptography
//                 </Term>{" "}
//                 and a{" "}
//                 <Term tip="After 1 day, or after the number of downloads you choose, the link stops working and the file is deleted forever. Nothing stays online.">
//                   link that deletes itself
//                 </Term>
//                 . Only the person you send it to can open the file.
//               </Text>

//                             <Stack gap={6} mt={4}>
//                 <Group gap={8}>
//                   <HardDrive size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} />
//                   <Text fz="xs" c="dimmed">Share files up to 500 MB.</Text>
//                 </Group>
//                 <Group gap={8}>
//                   <Clock size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} />
//                   <Text fz="xs" c="dimmed">Keep link open for up to 1 day.</Text>
//                 </Group>
//                 <Group gap={8}>
//                   <Download size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} />
//                   <Text fz="xs" c="dimmed">Link expires after up to {MAX_DOWNLOADS} downloads.</Text>
//                 </Group>
//               </Stack>

//             </Stack>
//           </SimpleGrid>
//                    <Box mt="lg">
//             <InfoBanner>
//               Files are locked in your browser before upload. Only people with the link
//               (and the password, if you set one) can ever read them.
//             </InfoBanner>
//           </Box>
//         </Card>
//       )}

//       {/* ---------- WINDOW 2: options + progress (wider on laptops) ---------- */}
//       {step === "options" && file && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
//           <UploadOptions
//             fileName={file.name}
//             fileSizeLabel={formatBytes(file.size)}
//             maxDownloads={maxDownloads}
//             onMaxDownloadsChange={setMaxDownloads}
//             isEncrypted={isEncrypted}
//             onIsEncryptedChange={setIsEncrypted}
//             password={password}
//             onPasswordChange={setPassword}
//             acceptedTerms={acceptedTerms}
//             onAcceptedTermsChange={setAcceptedTerms}
//             isWorking={isWorking}
//             onUpload={handleUpload}
//             onRemoveFile={() => { setFile(null); setStep("drop"); }}
//           />

//           {/* Live progress: thin blue bar, stage label, % on the right */}
//           {isWorking && (
//             <Paper withBorder radius="md" p="md" mt="md">
//               <Group justify="space-between" mb={6}>
//                 <Group gap={8}>
//                   <Loader size={14} color="var(--mantine-color-blue-6)" />
//                   <Text fz="sm" fw={600}>
//                     {stage === "encrypting" ? "Locking your file on this device" : "Uploading your file"}
//                   </Text>
//                 </Group>
//                 {stage === "uploading" && <Text fz="xs" c="dimmed" fw={700}>{progress}%</Text>}
//               </Group>
//               <Progress
//                 value={stage === "encrypting" ? 100 : progress}
//                 size={6}
//                 radius="xl"
//                 color="var(--mantine-color-blue-6)"
//                 striped={stage === "encrypting"}
//                 animated
//               />
//               {slowNote && (
//                 <Text fz="xs" c="dimmed" mt={6}>
//                   Connection looks slow. Hang tight, we're still working.
//                 </Text>
//               )}
//             </Paper>
//           )}

//           {failed && !isWorking && (
//             <Group mt="md">
//               <InfoBanner color="red">{failed}</InfoBanner>
//             </Group>
//           )}
//         </Card>
//       )}

//       {/* ---------- WINDOW 3: link ready (wider on laptops) ---------- */}
//       {step === "link" && shareUrl && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
//           <ShareLinkCard
//             shareUrl={shareUrl}
//             copied={copied}
//             isEncrypted={isEncrypted}
//             password={password}
//             fileName={file?.name}
//             onCopyPassword={() => { navigator.clipboard.writeText(password); toast.success("Password copied"); }}
//             maxDownloads={maxDownloads}
//             timeLeft={timeLeft}
//             onCopy={handleCopy}
//             onReset={reset}
//           />
//         </Card>
//       )}
//     </Container>
//   );
// }

// export default UploadPage;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////













//////////////////////////////////////////////////////////////////////////////////////////////////////////

// // ============================================================
// // UploadPage — THE SENDER'S VIEW (3 windows, like the PDF)
// // ============================================================
// import { useCallback, useEffect, useRef, useState } from "react";
// import toast from "react-hot-toast";
// import { Box, Card, Container, Group, Loader, Paper, Progress, SimpleGrid, Stack, Text, Title } from "@mantine/core";
// import { Clock, Download, HardDrive } from "lucide-react";
// import { FileDropzone } from "../components/FileDropzone";
// import { UploadOptions } from "../components/upload/UploadOptions";
// import { ShareLinkCard } from "../components/upload/ShareLinkCard";
// import { InfoBanner } from "../components/InfoBanner";
// import { Term } from "../components/Term";
// import { requestUploadUrl, uploadFileToS3WithProgress } from "../lib/api";
// import { encryptFile } from "../lib/crypto";
// import { validatePassword } from "../lib/password";

// const EXPIRY_SECONDS = 24 * 60 * 60; // 1 day ONLY
// const MAX_DOWNLOADS = 10;

// function formatBytes(bytes: number): string {
//   if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
//   if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
//   if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${bytes} B`;
// }

// async function hashPassword(password: string): Promise<string> {
//   const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
//   return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
// }

// function UploadPage() {
//   const [step, setStep] = useState<"drop" | "options" | "link">("drop");
//   const [file, setFile] = useState<File | null>(null);
//   const [isEncrypted, setIsEncrypted] = useState(true);
//   const [password, setPassword] = useState("");
//   const [maxDownloads, setMaxDownloads] = useState(10);
//   const [acceptedTerms, setAcceptedTerms] = useState(false);

//   const [isWorking, setIsWorking] = useState(false);
//   const [stage, setStage] = useState<"encrypting" | "uploading">("encrypting");
//   const [progress, setProgress] = useState(0);
//   const [slowNote, setSlowNote] = useState(false);
//   const [failed, setFailed] = useState<string | null>(null);
//   const startRef = useRef(0);

//   const [shareUrl, setShareUrl] = useState<string | null>(null);
//   const [copied, setCopied] = useState(false);
//   const [createdAt, setCreatedAt] = useState<number | null>(null);
//   const [timeLeft, setTimeLeft] = useState("24h 0m 0s");

//   useEffect(() => {
//     if (!createdAt) return;
//     const interval = window.setInterval(() => {
//       const diff = Math.max(0, createdAt + EXPIRY_SECONDS * 1000 - Date.now());
//       const h = Math.floor(diff / 3600000);
//       const m = Math.floor((diff % 3600000) / 60000);
//       const s = Math.floor((diff % 60000) / 1000);
//       setTimeLeft(`${h}h ${m}m ${s}s`);
//     }, 1000);
//     return () => window.clearInterval(interval);
//   }, [createdAt]);

//   const handleFileSelect = useCallback((f: File) => {
//     setFile(f); setStep("options"); setFailed(null);
//     toast.success(`Selected: ${f.name}`, { duration: 2500 });
//   }, []);

//   const handleUpload = async () => {
//     if (!file) return toast.error("Please select a file.");
//     if (isEncrypted) {
//       const v = validatePassword(password);
//       if (!v.valid) return toast.error(v.message || "Please enter a valid password.");
//     }
//     if (!acceptedTerms) return toast.error("Please accept the Terms & Privacy Policy.");
//     if (!navigator.onLine) { setFailed("You're offline. Check your internet, then press Upload again."); return; }

//     setFailed(null); setSlowNote(false); setProgress(0); setIsWorking(true); setStage("encrypting");
//     const controller = new AbortController();
//     const goOffline = () => controller.abort();
//     window.addEventListener("offline", goOffline);

//     try {
//       let fileToUpload: File | Blob = file;
//       let salt: string | null = null;
//       let iv: string | null = null;

//       if (isEncrypted) {
//         const enc = await encryptFile(file, password);
//         fileToUpload = enc.encryptedFile; salt = enc.salt; iv = enc.iv;
//       }

//       setStage("uploading");
//       startRef.current = Date.now();
//       const metadata = {
//         originalName: file.name,
//         mimeType: isEncrypted ? "application/octet-stream" : file.type,
//         sizeBytes: fileToUpload.size,
//         isEncrypted,
//         passwordHash: isEncrypted ? await hashPassword(password) : null,
//         iv, salt,
//         expirySeconds: EXPIRY_SECONDS,
//         maxDownloads,
//       };
//       const res = await requestUploadUrl(metadata);
//       const { presignedUrl, shareUrl: newShareUrl } = res.data;

//       await uploadFileToS3WithProgress(presignedUrl, fileToUpload as File, {
//         signal: controller.signal,
//         onProgress: (p) => {
//           setProgress(p);
//           if (Date.now() - startRef.current > 6000 && p < 90) setSlowNote(true);
//         },
//         onStall: () => setSlowNote(true),
//       });

//       setShareUrl(newShareUrl); setCreatedAt(Date.now()); setStep("link");
//       toast.success("Upload complete");
//     } catch (err) {
//       const base = !navigator.onLine
//         ? "Your internet dropped during the upload."
//         : err instanceof Error ? err.message : "Upload failed.";
//       setFailed(`${base} Don't worry, your file never left your device. Press Upload to try again.`);
//     } finally {
//       window.removeEventListener("offline", goOffline);
//       setIsWorking(false);
//     }
//   };

//   const handleCopy = (url: string) => {
//     navigator.clipboard.writeText(url);
//     setCopied(true);
//     toast.success("Link copied", { duration: 2000 });
//   };

//   const reset = () => {
//     setStep("drop"); setFile(null); setPassword("");
//     setShareUrl(null); setCopied(false); setCreatedAt(null); setFailed(null);
//   };

//   return (
//     <Container size="xl" py={{ base: "md", sm: "xl" }}>
//       {step === "drop" && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
//           <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
//             <FileDropzone onFileSelect={handleFileSelect} />
//             <Stack justify="center" gap="md">
//               <Title order={2}>Simple, private file sharing</Title>
//               <Text c="dimmed" fz="sm" lh={1.8}>
//                 VaultHub lets you share files with{" "}
//                 <Term tip="Cryptography means your file is scrambled into a secret code on your device before upload. Only the right password can unscramble it. Even we cannot read it.">
//                   cryptography
//                 </Term>{" "}
//                 and a{" "}
//                 <Term tip="After 1 day, or after the number of downloads you choose, the link stops working and the file is deleted forever. Nothing stays online.">
//                   link that deletes itself
//                 </Term>
//                 . Only the person you send it to can open the file.
//               </Text>

//               <Stack gap={6} mt={4}>
//                 <Group gap={8}>
//                   <HardDrive size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} />
//                   <Text fz="xs" c="dimmed">Share files up to 500 MB.</Text>
//                 </Group>
//                 <Group gap={8}>
//                   <Clock size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} />
//                   <Text fz="xs" c="dimmed">Keep link open for up to 1 day.</Text>
//                 </Group>
//                 <Group gap={8}>
//                   <Download size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} />
//                   <Text fz="xs" c="dimmed">Link expires after up to {MAX_DOWNLOADS} downloads.</Text>
//                 </Group>
//               </Stack>
//             </Stack>
//           </SimpleGrid>
//           <Box mt="lg">
//             <InfoBanner>
//               Files are locked in your browser before upload. Only people with the link
//               (and the password, if you set one) can ever read them.
//             </InfoBanner>
//           </Box>
//         </Card>
//       )}

//       {step === "options" && file && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
//           <UploadOptions
//             fileName={file.name}
//             fileSizeLabel={formatBytes(file.size)}
//             maxDownloads={maxDownloads}
//             onMaxDownloadsChange={setMaxDownloads}
//             isEncrypted={isEncrypted}
//             onIsEncryptedChange={setIsEncrypted}
//             password={password}
//             onPasswordChange={setPassword}
//             acceptedTerms={acceptedTerms}
//             onAcceptedTermsChange={setAcceptedTerms}
//             isWorking={isWorking}
//             onUpload={handleUpload}
//             onRemoveFile={() => { setFile(null); setStep("drop"); }}
//           />

//           {isWorking && (
//             <Paper withBorder radius="md" p="md" mt="md">
//               <Group justify="space-between" mb={6}>
//                 <Group gap={8}>
//                   <Loader size={14} color="var(--mantine-color-blue-6)" />
//                   <Text fz="sm" fw={600}>
//                     {stage === "encrypting" ? "Locking your file on this device" : "Uploading your file"}
//                   </Text>
//                 </Group>
//                 {stage === "uploading" && <Text fz="xs" c="dimmed" fw={700}>{progress}%</Text>}
//               </Group>
//               <Progress
//                 value={stage === "encrypting" ? 100 : progress}
//                 size={6}
//                 radius="xl"
//                 color="var(--mantine-color-blue-6)"
//                 striped={stage === "encrypting"}
//                 animated
//               />
//               {slowNote && (
//                 <Text fz="xs" c="dimmed" mt={6}>
//                   Connection looks slow. Hang tight, we're still working.
//                 </Text>
//               )}
//             </Paper>
//           )}

//           {failed && !isWorking && (
//             <Group mt="md">
//               <InfoBanner color="red">{failed}</InfoBanner>
//             </Group>
//           )}
//         </Card>
//       )}

//       {step === "link" && shareUrl && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
//           <ShareLinkCard
//             shareUrl={shareUrl}
//             copied={copied}
//             isEncrypted={isEncrypted}
//             password={password}
//             fileName={file?.name}
//             onCopyPassword={() => { navigator.clipboard.writeText(password); toast.success("Password copied"); }}
//             maxDownloads={maxDownloads}
//             timeLeft={timeLeft}
//             onCopy={handleCopy}
//             onReset={reset}
//           />
//         </Card>
//       )}
//     </Container>
//   );
// }

// export default UploadPage;



// ////////////////////////////////////////////////////////////////////////////////////
// // ============================================================
// // UploadPage — thin UI over the module-level Upload Engine.
// // ============================================================
// import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
// import toast from "react-hot-toast";
// import { Box, Card, Container, Group, Loader, Paper, Progress, SimpleGrid, Stack, Text, Title } from "@mantine/core";
// import { Clock, Download, HardDrive } from "lucide-react";
// import { FileDropzone } from "../components/FileDropzone";
// import { UploadOptions } from "../components/upload/UploadOptions";
// import { ShareLinkCard } from "../components/upload/ShareLinkCard";
// import { InfoBanner } from "../components/InfoBanner";
// import { Term } from "../components/Term";
// import { getEngineState, subscribeEngine, startUpload, resetEngine } from "../lib/uploadEngine";
// import { loadCheckpoint, listCheckpoints, clearCheckpoint } from "../lib/resumeStore";
// import type { UploadCheckpoint } from "../lib/resumeStore";
// import { abortMultipartUpload } from "../lib/api";
// import { validatePassword } from "../lib/password";

// const EXPIRY_SECONDS = 24 * 60 * 60;
// const MAX_DOWNLOADS = 10;

// function formatBytes(bytes: number): string {
//   if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
//   if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
//   if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${bytes} B`;
// }

// function UploadPage() {
//   const eng = useSyncExternalStore(subscribeEngine, getEngineState);
//   const isWorking = eng.status === "encrypting" || eng.status === "uploading" || eng.status === "stitching";

//   const [file, setFile] = useState<File | null>(null);
//   const [isEncrypted, setIsEncrypted] = useState(true);
//   const [password, setPassword] = useState("");
//   const [maxDownloads, setMaxDownloads] = useState(10);
//   const [acceptedTerms, setAcceptedTerms] = useState(false);
//   const [resumeHint, setResumeHint] = useState<string | null>(null);
//   const [pendingUploads, setPendingUploads] = useState<UploadCheckpoint[]>([]);
//   const [copied, setCopied] = useState(false);
//   const [timeLeft, setTimeLeft] = useState("24h 0m 0s");

//   // Derive createdAt from engine state (no ref, no setState in effect)
//   const createdAt = eng.createdAt;

//   const step: "drop" | "options" | "link" =
//     eng.status === "done" && eng.shareUrl ? "link"
//     : (file !== null || isWorking || eng.status === "error") ? "options"
//     : "drop";

//   // Countdown timer
//   useEffect(() => {
//     if (!createdAt) return;
//     const interval = window.setInterval(() => {
//       const diff = Math.max(0, createdAt + EXPIRY_SECONDS * 1000 - Date.now());
//       const h = Math.floor(diff / 3600000);
//       const m = Math.floor((diff % 3600000) / 60000);
//       const s = Math.floor((diff % 60000) / 1000);
//       setTimeLeft(`${h}h ${m}m ${s}s`);
//     }, 1000);
//     return () => window.clearInterval(interval);
//   }, [createdAt]);

//   // Anti-reload shield
//   useEffect(() => {
//     const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
//     if (isWorking) window.addEventListener("beforeunload", h);
//     return () => window.removeEventListener("beforeunload", h);
//   }, [isWorking]);

//   // Load interrupted uploads
//   useEffect(() => { listCheckpoints().then(setPendingUploads).catch(() => {}); }, []);
  
//   const cleanUpInterrupted = async () => {
//     for (const cp of pendingUploads) {
//       abortMultipartUpload(cp.token, cp.uploadId).catch(() => {});
//       await clearCheckpoint(cp.fileName, cp.fileSize);
//     }
//     setPendingUploads([]);
//     toast.success("Interrupted uploads cleaned up");
//   };

//   const handleFileSelect = useCallback(async (f: File) => {
//     setFile(f); setResumeHint(null);
//     const cp = await loadCheckpoint(f.name, f.size);
//     if (cp && cp.completedParts.length > 0 && cp.completedParts.length < cp.totalChunks) {
//       const pct = Math.round((cp.completedParts.length / cp.totalChunks) * 100);
//       setResumeHint(cp.isEncrypted
//         ? `Interrupted upload found (${pct}% done). Enter the SAME password, then press Upload to resume.`
//         : `Interrupted upload found (${pct}% done). Press Upload to resume.`);
//     }
//     toast.success(`Selected: ${f.name}`, { duration: 2500 });
//   }, []);

//   const handleUpload = async () => {
//     if (!file) return toast.error("Please select a file.");
//     if (isEncrypted) {
//       const v = validatePassword(password);
//       if (!v.valid) return toast.error(v.message || "Please enter a valid password.");
//     }
//     if (!acceptedTerms) return toast.error("Please accept the Terms & Privacy Policy.");
//     if (!navigator.onLine) return toast.error("You're offline. Check your internet.");
//     void startUpload({ file, password, isEncrypted, maxDownloads });
//   };

//   const handleCopy = (url: string) => { navigator.clipboard.writeText(url); setCopied(true); toast.success("Link copied", { duration: 2000 }); };

//   // Derive failedView directly from engine state (no useState + useEffect)
//   const failedView = eng.status === "error" ? eng.failed : null;

//   const reset = () => {
//     resetEngine();
//     setFile(null); setPassword(""); setCopied(false);
//     setResumeHint(null);
//   };

//   return (
//     <Container size="xl" py={{ base: "md", sm: "xl" }}>
//       {step === "drop" && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
//           {pendingUploads.length > 0 && (
//             <Box mb="md">
//               <InfoBanner color="blue">
//                 You have {pendingUploads.length} interrupted upload(s) on this device. Pick the same file again to resume, or{" "}
//                 <Text component="span" c="blue" fw={700} style={{ cursor: "pointer", textDecoration: "underline" }} onClick={cleanUpInterrupted}>
//                   cancel & clean up
//                 </Text>.
//               </InfoBanner>
//             </Box>
//           )}
//           <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
//             <FileDropzone onFileSelect={handleFileSelect} />
//             <Stack justify="center" gap="md">
//               <Title order={2}>Simple, private file sharing</Title>
//               <Text c="dimmed" fz="sm" lh={1.8}>
//                 VaultHub lets you share files with{" "}
//                 <Term tip="Cryptography means your file is scrambled into a secret code on your device before upload. Only the right password can unscramble it. Even we cannot read it.">cryptography</Term>{" "}
//                 and a{" "}
//                 <Term tip="After 1 day, or after the number of downloads you choose, the link stops working and the file is deleted forever. Nothing stays online.">link that deletes itself</Term>.
//                 Only the person you send it to can open the file.
//               </Text>
//               <Stack gap={6} mt={4}>
//                 <Group gap={8}><HardDrive size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} /><Text fz="xs" c="dimmed">Share files up to 500 MB.</Text></Group>
//                 <Group gap={8}><Clock size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} /><Text fz="xs" c="dimmed">Keep link open for up to 1 day.</Text></Group>
//                 <Group gap={8}><Download size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} /><Text fz="xs" c="dimmed">Link expires after up to {MAX_DOWNLOADS} downloads.</Text></Group>
//               </Stack>
//             </Stack>
//           </SimpleGrid>
//           <Box mt="lg">
//             <InfoBanner>Files are locked in your browser before upload. Only people with the link (and the password, if you set one) can ever read them.</InfoBanner>
//           </Box>
//         </Card>
//       )}

//       {step === "options" && (file || eng.fileName) && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
//           {resumeHint && (
//             <Group mt="md" mb="md"><InfoBanner color="blue">{resumeHint}</InfoBanner></Group>
//           )}
//           <UploadOptions
//             fileName={eng.fileName ?? file?.name ?? ""}
//             fileSizeLabel={formatBytes(file?.size ?? 0)}
//             maxDownloads={maxDownloads}
//             onMaxDownloadsChange={setMaxDownloads}
//             isEncrypted={isEncrypted}
//             onIsEncryptedChange={setIsEncrypted}
//             password={password}
//             onPasswordChange={setPassword}
//             acceptedTerms={acceptedTerms}
//             onAcceptedTermsChange={setAcceptedTerms}
//             isWorking={isWorking}
//             onUpload={handleUpload}
//             onRemoveFile={() => { setFile(null); setResumeHint(null); }}
//           />
//           {isWorking && (
//             <Paper withBorder radius="md" p="md" mt="md">
//               <Group justify="space-between" mb={6}>
//                 <Group gap={8}>
//                   <Loader size={14} color="var(--mantine-color-blue-6)" />
//                   <Text fz="sm" fw={600}>
//                     {eng.status === "encrypting" ? "Locking your file on this device"
//                       : eng.status === "stitching" ? "Stitching chunks together"
//                       : "Uploading your file"}
//                   </Text>
//                 </Group>
//                 {eng.status !== "encrypting" && <Text fz="xs" c="dimmed" fw={700}>{eng.progress}%</Text>}
//               </Group>
//               <Progress value={eng.status === "encrypting" ? 100 : eng.progress} size={6} radius="xl" color="var(--mantine-color-blue-6)" striped={eng.status === "encrypting"} animated />
//               {eng.chatter && <Text fz="xs" c="dimmed" mt={6}>{eng.chatter}</Text>}
//             </Paper>
//           )}
//           {failedView && !isWorking && (
//             <Group mt="md"><InfoBanner color="red">{failedView}</InfoBanner></Group>
//           )}
//         </Card>
//       )}

//       {step === "link" && eng.shareUrl && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
//           <ShareLinkCard
//             shareUrl={eng.shareUrl}
//             copied={copied}
//             isEncrypted={eng.isEncrypted}
//             password={eng.password}
//             fileName={eng.fileName ?? undefined}
//             onCopyPassword={() => { navigator.clipboard.writeText(eng.password); toast.success("Password copied"); }}
//             maxDownloads={maxDownloads}
//             timeLeft={timeLeft}
//             onCopy={handleCopy}
//             onReset={reset}
//           />
//         </Card>
//       )}
//     </Container>
//   );
// }

// export default UploadPage;

// // ============================================================
// // UploadPage — THE SENDER'S VIEW
// // ============================================================
// import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
// import toast from "react-hot-toast";
// import { Box, Card, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
// import { Clock, Download, HardDrive } from "lucide-react";
// import { FileDropzone } from "../components/FileDropzone";
// import { UploadOptions } from "../components/upload/UploadOptions";
// import { ShareLinkCard } from "../components/upload/ShareLinkCard";
// import { InfoBanner } from "../components/InfoBanner";
// import { Term } from "../components/Term";
// import { getEngineState, subscribeEngine, startUpload, resetEngine } from "../lib/uploadEngine";
// import { loadCheckpoint, listCheckpoints, clearCheckpoint } from "../lib/resumeStore";
// import type { UploadCheckpoint } from "../lib/resumeStore";
// import { abortMultipartUpload } from "../lib/api";
// import { validatePassword } from "../lib/password";

// const EXPIRY_SECONDS = 24 * 60 * 60; // 1 day
// const MAX_DOWNLOADS = 10;

// function formatBytes(bytes: number): string {
//   if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
//   if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
//   if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${bytes} B`;
// }

// export function UploadPage() {
//   const eng = useSyncExternalStore(subscribeEngine, getEngineState);
//   const isWorking = eng.status === "encrypting" || eng.status === "uploading" || eng.status === "stitching";

//   const [file, setFile] = useState<File | null>(null);
//   const [isEncrypted, setIsEncrypted] = useState(true);
//   const [password, setPassword] = useState("");
//   const [maxDownloads, setMaxDownloads] = useState(10);
//   const [acceptedTerms, setAcceptedTerms] = useState(false);
//   const [resumeHint, setResumeHint] = useState<string | null>(null);
//   const [pendingUploads, setPendingUploads] = useState<UploadCheckpoint[]>([]);
//   const [copied, setCopied] = useState(false);
//   const [timeLeft, setTimeLeft] = useState("24h 0m 0s");
//   const [uploadStarted, setUploadStarted] = useState(false);

//   // Derive createdAt from engine state
//   const createdAt = eng.createdAt;

//   const step: "drop" | "options" | "link" =
//     eng.status === "done" && eng.shareUrl ? "link"
//     : (file !== null || isWorking || eng.status === "error") ? "options"
//     : "drop";

//   // Countdown timer
//   useEffect(() => {
//     if (!createdAt) return;
//     const interval = window.setInterval(() => {
//       const diff = Math.max(0, createdAt + EXPIRY_SECONDS * 1000 - Date.now());
//       const h = Math.floor(diff / 3600000);
//       const m = Math.floor((diff % 3600000) / 60000);
//       const s = Math.floor((diff % 60000) / 1000);
//       setTimeLeft(`${h}h ${m}m ${s}s`);
//     }, 1000);
//     return () => window.clearInterval(interval);
//   }, [createdAt]);

//   // Anti-reload shield
//   useEffect(() => {
//     const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
//     if (isWorking) window.addEventListener("beforeunload", h);
//     return () => window.removeEventListener("beforeunload", h);
//   }, [isWorking]);

//   // Load interrupted uploads on mount
//   useEffect(() => { 
//     console.log("[UploadPage] Checking for interrupted uploads...");
//     listCheckpoints().then(setPendingUploads).catch(() => {}); 
//   }, []);
  
//   // // Clean up IndexedDB when upload completes or fails
//   // useEffect(() => {
//   //   if (eng.status === "done" || eng.status === "error") {
//   //     console.log("[UploadPage] Cleaning up checkpoints after upload completion/failure");
//   //     const cleanup = async () => {
//   //       for (const cp of pendingUploads) {
//   //         await clearCheckpoint(cp.fileName, cp.fileSize).catch(() => {});
//   //       }
//   //       setPendingUploads([]);
//   //       setUploadStarted(false);
//   //     };
//   //     cleanup();
//   //   }
//   // }, [eng.status, pendingUploads]);

//   const cleanUpInterrupted = async () => {
//     console.log("[UploadPage] Cleaning up interrupted uploads...");
//     for (const cp of pendingUploads) {
//       abortMultipartUpload(cp.token, cp.uploadId).catch(() => {});
//       await clearCheckpoint(cp.fileName, cp.fileSize);
//     }
//     setPendingUploads([]);
//     toast.success("Interrupted uploads cleaned up");
//   };

//   const handleFileSelect = useCallback(async (f: File) => {
//     console.log(`[UploadPage] File selected: ${f.name} (${formatBytes(f.size)})`);
//     setFile(f); 
//     setResumeHint(null);
//     setUploadStarted(false);
//     const cp = await loadCheckpoint(f.name, f.size);
//     if (cp && cp.completedParts.length > 0 && cp.completedParts.length < cp.totalChunks) {
//       const pct = Math.round((cp.completedParts.length / cp.totalChunks) * 100);
//       setResumeHint(cp.isEncrypted
//         ? `Interrupted upload found (${pct}% done). Enter the SAME password, then press Upload to resume.`
//         : `Interrupted upload found (${pct}% done). Press Upload to resume.`);
//     }
//     toast.success(`Selected: ${f.name}`, { duration: 2500 });
//   }, []);

//   const handleUpload = async () => {
//     console.log("[UploadPage] Upload initiated");
//     if (!file) return toast.error("Please select a file.");
//     if (uploadStarted) {
//       console.log("[UploadPage] Upload already in progress, ignoring duplicate call");
//       return;
//     }
//     if (isEncrypted) {
//       const v = validatePassword(password);
//       if (!v.valid) return toast.error(v.message || "Please enter a valid password.");
//     }
//     if (!acceptedTerms) return toast.error("Please accept the Terms & Privacy Policy.");
//     if (!navigator.onLine) return toast.error("You're offline. Check your internet.");
    
//     setUploadStarted(true);
//     void startUpload({ file, password, isEncrypted, maxDownloads });
//   };

//   const handleCopy = (url: string) => { 
//     console.log("[UploadPage] Link copied to clipboard");
//     navigator.clipboard.writeText(url); 
//     setCopied(true); 
//     toast.success("Link copied", { duration: 2000 }); 
//   };

//   const reset = () => {
//     console.log("[UploadPage] Resetting upload state");
//     resetEngine();
//     setFile(null); 
//     setPassword(""); 
//     setCopied(false);
//     setResumeHint(null);
//     setUploadStarted(false);
//   };

//   return (
//     <Container size="xl" py={{ base: "md", sm: "xl" }}>
//       {step === "drop" && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
//           {pendingUploads.length > 0 && (
//             <Box mb="md">
//               <InfoBanner color="blue">
//                 You have {pendingUploads.length} interrupted upload(s) on this device. Pick the same file again to resume, or{" "}
//                 <Text component="span" c="blue" fw={700} style={{ cursor: "pointer", textDecoration: "underline" }} onClick={cleanUpInterrupted}>
//                   cancel & clean up
//                 </Text>.
//               </InfoBanner>
//             </Box>
//           )}
//           <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
//             <FileDropzone onFileSelect={handleFileSelect} />
//             <Stack justify="center" gap="md">
//               <Title order={2}>Simple, private file sharing</Title>
//               <Text c="dimmed" fz="sm" lh={1.8}>
//                 Sendly lets you share files with{" "}
//                 <Term tip="Cryptography means your file is scrambled into a secret code on your device before upload. Only the right password can unscramble it. Even we cannot read it.">cryptography</Term>{" "}
//                 and a{" "}
//                 <Term tip="After 1 day, or after the number of downloads you choose, the link stops working and the file is deleted forever. Nothing stays online.">link that deletes itself</Term>.
//                 Only the person you send it to can open the file.
//               </Text>
//               <Stack gap={6} mt={4}>
//                 <Group gap={8}><HardDrive size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} /><Text fz="xs" c="dimmed">Share files up to 500 MB.</Text></Group>
//                 <Group gap={8}><Clock size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} /><Text fz="xs" c="dimmed">Keep link open for up to 1 day.</Text></Group>
//                 <Group gap={8}><Download size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} /><Text fz="xs" c="dimmed">Link expires after up to {MAX_DOWNLOADS} downloads.</Text></Group>
//               </Stack>
//             </Stack>
//           </SimpleGrid>
//           <Box mt="lg">
//             <InfoBanner>Files are locked in your browser before upload. Only people with the link (and the password, if you set one) can ever read them.</InfoBanner>
//           </Box>
//         </Card>
//       )}

//       {step === "options" && (file || eng.fileName) && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
//           {resumeHint && (
//             <Group mt="md" mb="md"><InfoBanner color="blue">{resumeHint}</InfoBanner></Group>
//           )}
//           <UploadOptions
//             fileName={eng.fileName ?? file?.name ?? ""}
//             fileSizeLabel={formatBytes(file?.size ?? 0)}
//             maxDownloads={maxDownloads}
//             onMaxDownloadsChange={setMaxDownloads}
//             isEncrypted={isEncrypted}
//             onIsEncryptedChange={setIsEncrypted}
//             password={password}
//             onPasswordChange={setPassword}
//             acceptedTerms={acceptedTerms}
//             onAcceptedTermsChange={setAcceptedTerms}
//             isWorking={isWorking}
//             onUpload={handleUpload}
//             onRemoveFile={() => { setFile(null); setResumeHint(null); setUploadStarted(false); }}
//             // Pass progress and chatter ONLY if working
//             progress={isWorking ? eng.progress : undefined}
//             chatter={isWorking ? eng.chatter : undefined}
//             onCancel={() => {
//               console.log("[UploadPage] Upload cancelled by user");
//               reset();
//             }}
//             resumeLabel={eng.status === "error" ? "Try Again" : resumeHint ? "Resume Upload" : undefined}
//           />
//         </Card>
//       )}

//       {step === "link" && eng.shareUrl && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
//           <ShareLinkCard
//             shareUrl={eng.shareUrl}
//             copied={copied}
//             isEncrypted={eng.isEncrypted}
//             password={eng.password}
//             fileName={eng.fileName ?? undefined}
//             onCopyPassword={() => { navigator.clipboard.writeText(eng.password); toast.success("Password copied"); }}
//             maxDownloads={maxDownloads}
//             timeLeft={timeLeft}
//             onCopy={handleCopy}
//             onReset={reset}
//           />
//         </Card>
//       )}
//     </Container>
//   );
// }

// export default UploadPage;


// ============================================================
// UploadPage — THE SENDER'S VIEW
// ============================================================
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import { Box, Card, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Clock, Download, HardDrive } from "lucide-react";
import { FileDropzone } from "../components/FileDropzone";
import { UploadOptions } from "../components/upload/UploadOptions";
import { ShareLinkCard } from "../components/upload/ShareLinkCard";
import { InfoBanner } from "../components/InfoBanner";
import { Term } from "../components/Term";
import { getEngineState, subscribeEngine, startUpload, resetEngine, cancelUpload } from "../lib/uploadEngine";
import { loadCheckpoint, listCheckpoints, clearCheckpoint } from "../lib/resumeStore";
import type { UploadCheckpoint } from "../lib/resumeStore";
import { abortMultipartUpload } from "../lib/api";
import { validatePassword } from "../lib/password";
import { revealInstallPrompt } from "../lib/pwa";

const EXPIRY_SECONDS = 24 * 60 * 60; // 1 day
const MAX_DOWNLOADS = 10;

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function UploadPage() {
  const eng = useSyncExternalStore(subscribeEngine, getEngineState);
  // 🚨 DEBUG: Log every engine state change
  useEffect(() => {
    console.log(`%c[UploadPage] Engine state changed:`, "color: purple; font-weight: bold;", {
      status: eng.status,
      progress: eng.progress,
      chatter: eng.chatter,
      failed: eng.failed,
    });
  }, [eng.status, eng.progress, eng.chatter, eng.failed]);
  const isWorking = eng.status === "encrypting" || eng.status === "uploading" || eng.status === "stitching";
  
  const [file, setFile] = useState<File | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [password, setPassword] = useState("");
  const [maxDownloads, setMaxDownloads] = useState(10);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [resumeHint, setResumeHint] = useState<string | null>(null);
  const [pendingUploads, setPendingUploads] = useState<UploadCheckpoint[]>([]);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("24h 0m 0s");
  const [uploadStarted, setUploadStarted] = useState(false);
  

  const createdAt = eng.createdAt;
  const step: "drop" | "options" | "link" =
    eng.status === "done" && eng.shareUrl ? "link"
    : (file !== null || isWorking || eng.status === "error") ? "options"
    : "drop";

  useEffect(() => {
    if (!createdAt) return;
    const interval = window.setInterval(() => {
      const diff = Math.max(0, createdAt + EXPIRY_SECONDS * 1000 - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [createdAt]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    if (isWorking) window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [isWorking]);

  useEffect(() => {
    console.log("[UploadPage] Checking for interrupted uploads...");
    listCheckpoints().then(setPendingUploads).catch(() => {});
  }, []);
  // Show PWA install prompt when upload finishes successfully
useEffect(() => {
  if (eng.status === "done") {
    revealInstallPrompt();
  }
}, [eng.status]);

  const cleanUpInterrupted = async () => {
    console.log("[UploadPage] Cleaning up interrupted uploads...");
    for (const cp of pendingUploads) {
      abortMultipartUpload(cp.token, cp.uploadId).catch(() => {});    
      await clearCheckpoint(cp.fileName, cp.fileSize);
    }
    setPendingUploads([]);
    toast.success("Interrupted uploads cleaned up");
  };

  const handleFileSelect = useCallback(async (f: File) => {
    console.log(`[UploadPage] File selected: ${f.name} (${formatBytes(f.size)})`);
    setFile(f);
    setResumeHint(null);
    setUploadStarted(false);
    
    const cp = await loadCheckpoint(f.name, f.size);
    if (cp && cp.completedParts.length > 0 && cp.completedParts.length < cp.totalChunks) {
      const pct = Math.round((cp.completedParts.length / cp.totalChunks) * 100);
      setResumeHint(
        cp.isEncrypted
          ? `Interrupted upload found (${pct}% done). Enter the SAME password, then press Upload to resume.`
          : `Interrupted upload found (${pct}% done). Press Upload to resume.`
      );
    }
    toast.success(`Selected: ${f.name}`, { duration: 2500 });
  }, []);

  const handleUpload = async () => {
    console.log("[UploadPage] Upload initiated");
    if (!file) return toast.error("Please select a file.");
    if (uploadStarted) {
      console.log("[UploadPage] Upload already in progress, ignoring duplicate call");
      return;
    }
    if (isEncrypted) {
      const v = validatePassword(password);
      if (!v.valid) return toast.error(v.message || "Please enter a valid password.");
    }
    if (!acceptedTerms) return toast.error("Please accept the Terms & Privacy Policy.");
    if (!navigator.onLine) return toast.error("You're offline. Check your internet.");
    
    setUploadStarted(true);
    void startUpload({ file, password, isEncrypted, maxDownloads });
  };

  const handleCopy = (url: string) => {
    console.log("[UploadPage] Link copied to clipboard");
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied", { duration: 2000 });
  };

  const reset = () => {
    console.log("[UploadPage] Resetting upload state");
    resetEngine();
    setFile(null);
    setPassword("");
    setCopied(false);
    setResumeHint(null);
    setUploadStarted(false);
  };

  return (
    <Container size="xl" py={{ base: "md", sm: "xl" }}>
      {step === "drop" && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
          {pendingUploads.length > 0 && (
            <Box mb="md">
              <InfoBanner color="blue">
                You have {pendingUploads.length} interrupted upload(s) on this device. Pick the same file again to resume, or{" "}
                <Text component="span" c="blue" fw={700} style={{ cursor: "pointer", textDecoration: "underline" }} onClick={cleanUpInterrupted}>
                  cancel & clean up
                </Text>.
              </InfoBanner>
            </Box>
          )}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <FileDropzone onFileSelect={handleFileSelect} />
            <Stack justify="center" gap="md">
              <Title order={2}>Simple, private file sharing</Title>
              <Text c="dimmed" fz="sm" lh={1.8}>
                Sendly lets you share files with{" "}
                <Term tip="Cryptography means your file is scrambled into a secret code on your device before upload. Only the right password can unscramble it. Even we cannot read it.">cryptography</Term>{" "}
                and a{" "}
                <Term tip="After 1 day, or after the number of downloads you choose, the link stops working and the file is deleted forever. Nothing stays online">temporary cloud storage & link </Term>
                Only the person you send it to can open the file
              </Text>
              <Stack gap={6} mt={4}>
                <Group gap={8}><HardDrive size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} /><Text fz="xs" c="dimmed">Share files up to 500 MB.</Text></Group>
                <Group gap={8}><Clock size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} /><Text fz="xs" c="dimmed">Keep link open for up to 1 day.</Text></Group>
                <Group gap={8}><Download size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} /><Text fz="xs" c="dimmed">Link expires after up to {MAX_DOWNLOADS} downloads.</Text></Group>
              </Stack>
            </Stack>
          </SimpleGrid>
          <Box mt="lg">
            <InfoBanner>Files are locked in your browser before upload. Only people with the link (and the password, if you set one) can ever read them.</InfoBanner>
          </Box>
        </Card>
      )}

      {step === "options" && (file || eng.fileName) && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
          {resumeHint && (
            <Group mt="md" mb="md"><InfoBanner color="blue">{resumeHint}</InfoBanner></Group>
          )}
          
          {/* 🚨 FIX: Display the deliberate red error banner when quota/file limits are hit */}
          {eng.status === "error" && eng.failed && (
            <Group mt="md" mb="md"><InfoBanner color="red">{eng.failed}</InfoBanner></Group>
          )}

          <UploadOptions
            fileName={eng.fileName ?? file?.name ?? ""}
            fileSizeLabel={formatBytes(file?.size ?? 0)}
            maxDownloads={maxDownloads}
            onMaxDownloadsChange={setMaxDownloads}
            isEncrypted={isEncrypted}
            onIsEncryptedChange={setIsEncrypted}
            password={password}
            onPasswordChange={setPassword}
            acceptedTerms={acceptedTerms}
            onAcceptedTermsChange={setAcceptedTerms}
            isWorking={isWorking}
            onUpload={handleUpload}
            onRemoveFile={() => {
              console.log("[UploadPage] File removed, cleaning up any interrupted uploads");
              cancelUpload(); 
              setFile(null);
              setResumeHint(null);
              setUploadStarted(false);
            }}
            progress={isWorking ? eng.progress : undefined}
            chatter={isWorking ? eng.chatter : undefined}
            onCancel={() => {
              console.log("[UploadPage] Upload cancelled by user");
              cancelUpload();
              reset();
            }}
            resumeLabel={eng.status === "error" ? "Try Again" : resumeHint ? "Resume Upload" : undefined}
          />
        </Card>
      )}

      {step === "link" && eng.shareUrl && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
          <ShareLinkCard
            shareUrl={eng.shareUrl}
            copied={copied}
            isEncrypted={eng.isEncrypted}
            password={eng.password}
            fileName={eng.fileName ?? undefined}
            onCopyPassword={() => { navigator.clipboard.writeText(eng.password); toast.success("Password copied"); }}
            maxDownloads={maxDownloads}
            timeLeft={timeLeft}
            onCopy={handleCopy}
            onReset={reset}
          />
        </Card>
      )}
    </Container>
  );
}

export default UploadPage;