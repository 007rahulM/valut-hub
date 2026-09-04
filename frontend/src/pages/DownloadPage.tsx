

// // // ============================================================
// // // DownloadPage - THE RECIPIENT'S VIEW
// // //
// // // SECURITY: password is verified ONLY by the backend when the
// // // single button is pressed. Wrong password = inline error and
// // // the card stays locked. Nothing is consumed on a wrong try.
// // //
// // // ONE-BUTTON FLOW:
// // //   encrypted file  -> button says "Unlock and download"
// // //   plain file      -> button says "Download"
// // //   pressed         -> backend verifies, then the file downloads
// // //
// // // LAYOUT: left = file info, right = action card + good-to-know card
// // // ============================================================

// // import { useEffect, useRef, useState } from "react";
// // import { useParams } from "react-router-dom";
// // import toast from "react-hot-toast";
// // import {
// //   Box, Button, Card, Container, Group, Paper, PasswordInput, Progress,
// //   SimpleGrid, Skeleton, Stack, Text, Title,
// // } from "@mantine/core";
// // import { Clock, Download as DownloadIcon, File as FileIcon, Lock, ShieldCheck } from "lucide-react";
// // import { Illustration } from "../components/Illustration";
// // import { LinkExpiredCard } from "../components/download/LinkExpiredCard";
// // import { ConnectionLostCard } from "../components/download/ConnectionLostCard";
// // import { DownloadCompleteCard } from "../components/download/DownloadCompleteCard";
// // import { fetchFileMetadata, requestDownloadUrl } from "../lib/api";
// // import { downloadBlobWithProgress, triggerDownloadFromBlob, triggerDownloadFromArrayBuffer } from "../lib/download";
// // import { decryptFile } from "../lib/crypto";

// // interface FileMetadata {
// //   originalName: string;
// //   mimeType: string;
// //   sizeBytes: number;
// //   isEncrypted: boolean;
// //   expiresAt: string;
// //   downloadCount: number;
// // }

// // type ErrorKind = "network" | "server" | "expired";

// // function classifyError(err: unknown): ErrorKind {
// //   const e = err as { response?: { status?: number }; code?: string; message?: string };
// //   const status = e?.response?.status;
// //   if (status === 404 || status === 410) return "expired";
// //   if (status && status >= 500) return "server";
// //   const msg = `${e?.message ?? ""} ${e?.code ?? ""}`;
// //   if (/404|410|expired|not found|no such/i.test(msg)) return "expired";
// //   if (!status && /network|fetch|offline|connection|econn|enotfound|timeout/i.test(msg)) return "network";
// //   if (!status && typeof navigator !== "undefined" && !navigator.onLine) return "network";
// //   return "server";
// // }

// // function formatFileSize(bytes: number): string {
// //   if (bytes === 0) return "0 Bytes";
// //   const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
// //   const i = Math.floor(Math.log(bytes) / Math.log(k));
// //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
// // }

// // function Detail({ label, value }: { label: string; value: string }) {
// //   return (
// //     <div>
// //       <Text fz={10} c="dimmed" tt="uppercase" fw={600}>{label}</Text>
// //       <Text fz="sm" fw={500} mt={2}>{value}</Text>
// //     </div>
// //   );
// // }

// // export function DownloadPage() {
// //   const { token } = useParams<{ token: string }>();

// //   // Read #password fragment once, during first render
// //   const hashPassword = (() => {
// //     const h = typeof window !== "undefined" ? window.location.hash : "";
// //     return h && h.length > 1 ? decodeURIComponent(h.slice(1)) : "";
// //   })();
// //   const hashAutoFilled = hashPassword.length > 0;

// //   const [file, setFile] = useState<FileMetadata | null>(null);
// //   const [loading, setLoading] = useState<boolean>(() => !!token);
// //   const [errorKind, setErrorKind] = useState<ErrorKind | null>(token ? null : "expired");
// //   const [attempt, setAttempt] = useState(0);
// //   const [password, setPassword] = useState(hashPassword);
// //   const [unlockError, setUnlockError] = useState<string | null>(null);
// //   const [downloading, setDownloading] = useState(false);
// //   const [complete, setComplete] = useState(false);
// //   const [dlProgress, setDlProgress] = useState<number | null>(null);
// //   const [dlSlow, setDlSlow] = useState(false);
// //   const [autoFilled] = useState(hashAutoFilled);
// //   const dlStartRef = useRef(0);

// //   useEffect(() => {
// //     if (!token) return;
// //     let cancelled = false;
// //     fetchFileMetadata(token)
// //       .then((data) => {
// //         if (!cancelled) { setFile(data); setErrorKind(null); setLoading(false); }
// //       })
// //       .catch((err) => {
// //         if (!cancelled) { setErrorKind(classifyError(err)); setLoading(false); }
// //       });
// //     return () => { cancelled = true; };
// //   }, [token, attempt]);

// //   // Strip #fragment from the address bar (side effect only)
// //   useEffect(() => {
// //     if (window.location.hash && window.location.hash.length > 1) {
// //       window.history.replaceState(null, "", window.location.pathname + window.location.search);
// //     }
// //   }, []);

// //   const retry = () => { setLoading(true); setErrorKind(null); setAttempt((a) => a + 1); };

// //   // ONE button: backend verifies the password, then the file downloads
// //   const handleDownload = async () => {
// //     if (!token || !file) return;
// //     if (file.isEncrypted && !password) {
// //       setUnlockError("Enter the password first.");
// //       return;
// //     }
// //     if (!navigator.onLine) { toast.error("You're offline. Check your internet and try again."); return; }

// //     setDownloading(true); setDlProgress(0); setDlSlow(false); setUnlockError(null);
// //     dlStartRef.current = Date.now();
// //     const onProg = (p: number | null) => {
// //       if (p !== null) {
// //         setDlProgress(p);
// //         if (Date.now() - dlStartRef.current > 5000 && p < 90) setDlSlow(true);
// //       }
// //     };

// //     try {
// //       // Backend checks the password here. Wrong = 403, nothing consumed.
// //       const d = await requestDownloadUrl(token, file.isEncrypted ? password : undefined);
// //       const blob = await downloadBlobWithProgress(d.downloadUrl, onProg);

// //       if (!d.isEncrypted) {
// //         triggerDownloadFromBlob(blob, d.originalName);
// //         toast.success("Download started");
// //       } else {
// //         if (!d.salt || !d.iv) throw new Error("Missing encryption parameters");
// //         const data = await blob.arrayBuffer();
// //         const decrypted = await decryptFile(data, password, d.salt, d.iv);
// //         triggerDownloadFromArrayBuffer(decrypted, d.originalName, d.mimeType);
// //         toast.success("File decrypted");
// //       }
// //       setComplete(true);
// //     } catch (err) {
// //       const msg = err instanceof Error ? err.message : "Download failed";
// //       if (/incorrect password|wrong password|403/i.test(msg)) {
// //         // Stay locked, show inline error, keep the password for editing
// //         setUnlockError("Wrong password. Check it with the sender and try again.");
// //       } else {
// //         toast.error(msg);
// //       }
// //     } finally {
// //       setDownloading(false);
// //       setDlProgress(null);
// //     }
// //   };

// //   return (
// //     <Container size="md" py={{ base: "md", sm: "xl" }}>
// //       {loading && (
// //         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
// //           <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
// //             <Stack gap="md">
// //               <Skeleton height={160} radius="md" />
// //               <Group gap="sm" wrap="nowrap">
// //                 <Skeleton height={40} width={40} radius="md" />
// //                 <Stack gap={8} style={{ flex: 1 }}>
// //                   <Skeleton height={12} width="55%" />
// //                   <Skeleton height={10} width="35%" />
// //                 </Stack>
// //               </Group>
// //             </Stack>
// //             <Stack gap="md">
// //               <Skeleton height={120} radius="md" />
// //               <Skeleton height={140} radius="md" />
// //             </Stack>
// //           </SimpleGrid>
// //         </Card>
// //       )}

// //       {!loading && errorKind === "network" && <ConnectionLostCard variant="network" onRetry={retry} />}
// //       {!loading && errorKind === "server" && <ConnectionLostCard variant="server" onRetry={retry} />}
// //       {!loading && errorKind === "expired" && <LinkExpiredCard />}

// //       {!loading && !errorKind && complete && (
// //         <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
// //           <DownloadCompleteCard />
// //         </Card>
// //       )}

// //       {!loading && !errorKind && file && !complete && (
// //         <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
// //           {/* Clean white header, no orange line */}
// //           <Group p="md" gap="sm">
// //             <Paper w={40} h={40} radius="md" bg="var(--mantine-color-brand-light)" c="brand"
// //               style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// //               <DownloadIcon size={20} />
// //             </Paper>
// //             <div>
// //               <Title order={3}>Download files</Title>
// //               <Text fz="xs" c="dimmed">Shared securely with VaultHub</Text>
// //             </div>
// //           </Group>

// //           <Box p={{ base: "md", sm: "xl" }} style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
// //             <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
// //               {/* LEFT: the file */}
// //               <Stack gap="md">
// //                 <Illustration src="/illustrations/download.svg" alt="Downloading a file" maxWidth={220} />

// //                 <Group gap="sm" wrap="nowrap">
// //                   <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue"
// //                     style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// //                     <FileIcon size={20} />
// //                   </Paper>
// //                   <div style={{ minWidth: 0 }}>
// //                     <Text fw={600} lineClamp={1}>{file.originalName}</Text>
// //                     <Text fz="xs" c="dimmed">{file.mimeType}</Text>
// //                   </div>
// //                 </Group>

// //                 <SimpleGrid cols={2}>
// //                   <Detail label="Size" value={formatFileSize(file.sizeBytes)} />
// //                   <Detail label="Expires" value={file.expiresAt?.split("T")[0] ?? ""} />
// //                   <Detail label="Encrypted" value={file.isEncrypted ? "Yes" : "No"} />
// //                   <Detail label="Downloads" value={String(file.downloadCount ?? 0)} />
// //                 </SimpleGrid>

// //                 <Paper withBorder radius="md" p="md" bg="var(--mantine-color-gray-0)">
// //                   <Group gap={8} wrap="nowrap" align="flex-start">
// //                     <ShieldCheck size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
// //                     <Text fz="xs" c="dimmed">
// //                       Locked on the sender's device. Deleted automatically after 1 day or 10 downloads.
// //                     </Text>
// //                   </Group>
// //                 </Paper>
// //               </Stack>

// //               {/* RIGHT: one action card + good-to-know card (no dead space) */}
// //               <Stack gap="md">
// //                 <Paper withBorder radius="md" p="md">
// //                   {file.isEncrypted ? (
// //                     <Stack gap="sm">
// //                       <Group gap={6}>
// //                         <Lock size={14} style={{ color: "var(--mantine-color-brand-6)" }} />
// //                         <Text fz="sm" fw={700}>This file is locked</Text>
// //                       </Group>
// //                       <Text fz="xs" c="dimmed">
// //                         Enter the password the sender shared with you, then press the button.
// //                         We never store it and can't recover it.
// //                       </Text>
// //                       {autoFilled && !unlockError && (
// //                         <Text fz="xs" c="green">Password auto-filled from your link.</Text>
// //                       )}
// //                       <PasswordInput
// //                         label="Password"
// //                         placeholder="Enter password to unlock"
// //                         value={password}
// //                         error={unlockError ?? undefined}
// //                         onChange={(e) => { setPassword(e.currentTarget.value); setUnlockError(null); }}
// //                       />
// //                       <Button fullWidth size="md" loading={downloading} onClick={handleDownload}
// //                         leftSection={<Lock size={16} />}>
// //                         {downloading && dlProgress !== null ? `Downloading... ${dlProgress}%` : "Unlock and download"}
// //                       </Button>
// //                     </Stack>
// //                   ) : (
// //                     <Stack gap="xs">
// //                       <Button fullWidth size="md" loading={downloading} onClick={handleDownload}
// //                         leftSection={<DownloadIcon size={16} />}>
// //                         {downloading && dlProgress !== null ? `Downloading... ${dlProgress}%` : "Download"}
// //                       </Button>
// //                     </Stack>
// //                   )}

// //                   {downloading && dlProgress !== null && (
// //                     <>
// //                       <Progress value={dlProgress} size={6} radius="xl" color="var(--mantine-color-blue-6)" mt={6} />
// //                       {dlSlow && (
// //                         <Text fz="xs" c="dimmed" mt={4}>Large file or slow connection. Hang tight, it's working.</Text>
// //                       )}
// //                     </>
// //                   )}
// //                 </Paper>

// //                 <Paper withBorder radius="md" p="md">
// //                   <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb={6}>Good to know</Text>
// //                   <Stack gap={8}>
// //                     <Group gap={8} wrap="nowrap" align="flex-start">
// //                       <Lock size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
// //                       <Text fz="xs" c="dimmed">The password never reaches us. Unlocking happens on your device.</Text>
// //                     </Group>
// //                     <Group gap={8} wrap="nowrap" align="flex-start">
// //                       <Clock size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
// //                       <Text fz="xs" c="dimmed">The link dies after its expiry date or download count, whichever comes first.</Text>
// //                     </Group>
// //                     <Group gap={8} wrap="nowrap" align="flex-start">
// //                       <ShieldCheck size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
// //                       <Text fz="xs" c="dimmed">Nothing is saved on your device until the download finishes.</Text>
// //                     </Group>
// //                   </Stack>
// //                 </Paper>
// //               </Stack>
// //             </SimpleGrid>
// //           </Box>
// //         </Card>
// //       )}
// //     </Container>
// //   );
// // }

// // export default DownloadPage;




// // ============================================================
// // DownloadPage - THE RECIPIENT'S VIEW
// //
// // SECURITY: password is verified ONLY by the backend when the
// // single button is pressed. Wrong password = inline error and
// // the card stays locked. Nothing is consumed on a wrong try.
// //
// // ONE-BUTTON FLOW:
// //   encrypted file  -> button says "Unlock and download"
// //   plain file      -> button says "Download"
// //   pressed         -> backend verifies, then the file downloads
// //
// // PENALTY BOX UX (human voice inline, formal voice in toast):
// //   wrong 1..4 -> friendly/joking inline message + formal toast
// //   wrong 5    -> button disabled + live countdown timer
// //
// // LAYOUT: left = file info, right = action card + good-to-know card
// // ============================================================

// import { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import toast from "react-hot-toast";
// import {
//   Box, Button, Card, Container, Group, Paper, PasswordInput, Progress,
//   SimpleGrid, Skeleton, Stack, Text, Title,
// } from "@mantine/core";
// import { Clock, Download as DownloadIcon, File as FileIcon, Lock, ShieldCheck } from "lucide-react";
// import { Illustration } from "../components/Illustration";
// import { LinkExpiredCard } from "../components/download/LinkExpiredCard";
// import { ConnectionLostCard } from "../components/download/ConnectionLostCard";
// import { DownloadCompleteCard } from "../components/download/DownloadCompleteCard";
// import { fetchFileMetadata, requestDownloadUrl, ApiError } from "../lib/api";
// import { downloadBlobWithProgress, triggerDownloadFromBlob, triggerDownloadFromArrayBuffer } from "../lib/download";
// import { decryptFileAuto } from "../lib/crypto";
// import { revealInstallPrompt } from "../lib/pwa"; 
// interface FileMetadata {
//   originalName: string;
//   mimeType: string;
//   sizeBytes: number;
//   isEncrypted: boolean;
//   expiresAt: string;
//   downloadCount: number;
//   lockRemainingSeconds?: number;

// }

// type ErrorKind = "network" | "server" | "expired";

// function classifyError(err: unknown): ErrorKind {
//   const e = err as { response?: { status?: number }; code?: string; message?: string };
//   const status = e?.response?.status;
//   if (status === 404 || status === 410) return "expired";
//   if (status && status >= 500) return "server";
//   const msg = `${e?.message ?? ""} ${e?.code ?? ""}`;
//   if (/404|410|expired|not found|no such/i.test(msg)) return "expired";
//   if (!status && /network|fetch|offline|connection|econn|enotfound|timeout/i.test(msg)) return "network";
//   if (!status && typeof navigator !== "undefined" && !navigator.onLine) return "network";
//   return "server";
// }

// function formatFileSize(bytes: number): string {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
// }

// // m:ss formatter for the lockout countdown
// function formatSeconds(total: number): string {
//   const m = Math.floor(total / 60);
//   const s = total % 60;
//   return `${m}:${String(s).padStart(2, "0")}`;
// }

// function Detail({ label, value }: { label: string; value: string }) {
//   return (
//     <div>
//       <Text fz={10} c="dimmed" tt="uppercase" fw={600}>{label}</Text>
//       <Text fz="sm" fw={500} mt={2}>{value}</Text>
//     </div>
//   );
// }

// export function DownloadPage() {
//   const { token } = useParams<{ token: string }>();

//   // Read #password fragment once, during first render
//   const hashPassword = (() => {
//     const h = typeof window !== "undefined" ? window.location.hash : "";
//     return h && h.length > 1 ? decodeURIComponent(h.slice(1)) : "";
//   })();
//   const hashAutoFilled = hashPassword.length > 0;

//   const [file, setFile] = useState<FileMetadata | null>(null);
//   const [loading, setLoading] = useState<boolean>(() => !!token);
//   const [errorKind, setErrorKind] = useState<ErrorKind | null>(token ? null : "expired");
//   const [attempt, setAttempt] = useState(0);
//   const [password, setPassword] = useState(hashPassword);
//   const [unlockError, setUnlockError] = useState<string | null>(null);
//   const [downloading, setDownloading] = useState(false);
//   const [complete, setComplete] = useState(false);
//   const [dlProgress, setDlProgress] = useState<number | null>(null);
//   const [dlSlow, setDlSlow] = useState(false);
//   const [autoFilled] = useState(hashAutoFilled);

//   // Penalty Box states (backend-driven, never trusted from the user)
//   const [attemptsLeft, setAttemptsLeft] = useState(5);
//   const [lockoutSeconds, setLockoutSeconds] = useState(0);
//   const [inlineMessage, setInlineMessage] = useState("");

//   const dlStartRef = useRef(0);

//   // Countdown ticker for the lockout (1s ticks, purely visual — the backend is the real judge)
//   useEffect(() => {
//     if (lockoutSeconds > 0) {
//       const timer = setInterval(() => setLockoutSeconds((s) => s - 1), 1000);
//       return () => clearInterval(timer);
//     }
//   }, [lockoutSeconds]);

//     // ANTI-RELOAD SHIELD: warn if the user refreshes mid-download
//   useEffect(() => {
//     const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
//     if (downloading) window.addEventListener("beforeunload", h);
//     return () => window.removeEventListener("beforeunload", h);
//   }, [downloading]);

//   useEffect(() => {
//     if (!token) return;
//     let cancelled = false;
//     fetchFileMetadata(token)
//       .then((data) => {
//         if (!cancelled) { setFile(data); setErrorKind(null); setLoading(false);
//           if (data.lockRemainingSeconds && data.lockRemainingSeconds > 0) {
//   setLockoutSeconds(data.lockRemainingSeconds);
//   setInlineMessage("Too many wrong tries on this device. This link is resting for a bit.");
// }
//          }
//       })
//       .catch((err) => {
//         if (!cancelled) { setErrorKind(classifyError(err)); setLoading(false); }
//       });
//     return () => { cancelled = true; };
//   }, [token, attempt]);

//   // Strip #fragment from the address bar (side effect only)
//   useEffect(() => {
//     if (window.location.hash && window.location.hash.length > 1) {
//       window.history.replaceState(null, "", window.location.pathname + window.location.search);
//     }
//   }, []);
//   // Show PWA install prompt when download finishes successfully
// useEffect(() => {
//   if (complete) {
//     revealInstallPrompt();
//   }
// }, [complete]);

//   const retry = () => { setLoading(true); setErrorKind(null); setAttempt((a) => a + 1); };

//   // ONE button: backend verifies the password, then the file downloads
//   const handleDownload = async () => {
//     if (!token || !file) return;
//     if (lockoutSeconds > 0) return; // penalty box: button is dead until the timer ends
//     if (file.isEncrypted && !password) {
//       setUnlockError("Enter the password first.");
//       return;
//     }
//     if (!navigator.onLine) { toast.error("You're offline. Check your internet and try again."); return; }

//     setDownloading(true); setDlProgress(0); setDlSlow(false); setUnlockError(null);
//     dlStartRef.current = Date.now();
//     const onProg = (p: number | null) => {
//       if (p !== null) {
//         setDlProgress(p);
//         if (Date.now() - dlStartRef.current > 5000 && p < 90) setDlSlow(true);
//       }
//     };

//     try {
//       // Backend checks the password here. Wrong = 403, nothing consumed.
//       const d = await requestDownloadUrl(token, file.isEncrypted ? password : undefined);
//       const blob = await downloadBlobWithProgress(d.downloadUrl, onProg);

//       if (!d.isEncrypted) {
//         triggerDownloadFromBlob(blob, d.originalName);
//         toast.success("Download started");
//       } else {
//         if (!d.salt || !d.iv) throw new Error("Missing encryption parameters");
//         const data = await blob.arrayBuffer();
// const decrypted = await decryptFileAuto(data, password, d.salt, d.iv, d.sizeBytes);
//         triggerDownloadFromArrayBuffer(decrypted, d.originalName, d.mimeType);
//         toast.success("File decrypted");
//       }
//       setComplete(true);
//     } catch (err) {
//       if (err instanceof ApiError) {
//         if (err.code === "INVALID_PASSWORD") {
//           // Human voice inline (changes personality as attempts burn down)
//           const left = err.attemptsLeft ?? 0;
//           setAttemptsLeft(left);

//           // if (left === 4) setInlineMessage("Hmm, that didn't match. Give it another shot.");
//           // else if (left === 3) setInlineMessage("Still no luck. Maybe double-check how the sender spelled it.");
//           // else if (left === 2) setInlineMessage("Okay, either the sender typo'd it, or you two need a secret handshake. 😅 2 tries left.");
//           // else if (left === 1) setInlineMessage("Think hard — this is your LAST try before the link locks for 10 minutes.");
//           // else setInlineMessage("Wrong password.");

//           // The "Sendly Standard" Error Message Progression
// if (left === 4) {
//   setInlineMessage("Hmm, that didn't match. Passwords here are case-sensitive, so it's worth a second look");
// } 
// else if (left === 3) {
//   setInlineMessage("Still no luck. If the sender messaged you the password, copying it straight from their message usually does the trick");
// } 
// else if (left === 2) {
//   setInlineMessage("That's three misses. Two tries left before the link locks for 10 minutes — no rush, take a breath");
// } 
// else if (left === 1) {
//   setInlineMessage("One try left. If this doesn't match, the link locks for 10 minutes to keep the file safe. When in doubt, ask the sender to re-send the password");
// } 
// else {
//   // 0 tries left (The Lockout)
//   setInlineMessage("Too many wrong guesses, so this link is resting for 10 minutes. The countdown shows when it wakes up — and a quick message to the sender will save you the wait");
//   // Optional: Disable the input field and submit button here too!
// }

//           // Formal voice in the toast
//           toast.error(`Incorrect password. ${left} attempt${left === 1 ? "" : "s"} remaining.`);
//         } else if (err.code === "TOO_MANY_ATTEMPTS" || err.code === "DOWNLOAD_LOCKED") {
//           setAttemptsLeft(0);
//           setLockoutSeconds(err.retryAfterSeconds ?? 600);
//           setInlineMessage("Too many wrong tries. This link is taking a nap to protect the file.");
//           toast.error("Too many failed attempts. Locked for 10 minutes.");
//         } else {
//           toast.error(err.message);
//         }
//       } else {
//         toast.error(err instanceof Error ? err.message : "Download failed");
//       }
//     } finally {
//       setDownloading(false);
//       setDlProgress(null);
//     }
//   };

//   return (
//     <Container size="md" py={{ base: "md", sm: "xl" }}>
//       {loading && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
//           <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
//             <Stack gap="md">
//               <Skeleton height={160} radius="md" />
//               <Group gap="sm" wrap="nowrap">
//                 <Skeleton height={40} width={40} radius="md" />
//                 <Stack gap={8} style={{ flex: 1 }}>
//                   <Skeleton height={12} width="55%" />
//                   <Skeleton height={10} width="35%" />
//                 </Stack>
//               </Group>
//             </Stack>
//             <Stack gap="md">
//               <Skeleton height={120} radius="md" />
//               <Skeleton height={140} radius="md" />
//             </Stack>
//           </SimpleGrid>
//         </Card>
//       )}

//       {!loading && errorKind === "network" && <ConnectionLostCard variant="network" onRetry={retry} />}
//       {!loading && errorKind === "server" && <ConnectionLostCard variant="server" onRetry={retry} />}
//       {!loading && errorKind === "expired" && <LinkExpiredCard />}

//       {!loading && !errorKind && complete && (
//         <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
//           <DownloadCompleteCard />
//         </Card>
//       )}

//       {/* In the DownloadPage component, update the non-encrypted section:*/}

// {!loading && !errorKind && file && !complete && (
//   <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
//     {/* Header */}
//     <Group p="md" gap="sm">
//       <Paper w={40} h={40} radius="md" bg="var(--mantine-color-brand-light)" c="brand"
//         style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
//         <DownloadIcon size={20} />
//       </Paper>
//       <div>
//         <Title order={3}>Download files</Title>
//         <Text fz="xs" c="dimmed">Shared securely with Sendly</Text>
//       </div>
//     </Group>

//     <Box p={{ base: "md", sm: "xl" }} style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
//       <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
//         {/* LEFT: the file */}
//         <Stack gap="md">
//           <Illustration src="/illustrations/download.svg" alt="Downloading a file" maxWidth={220} />

//           <Group gap="sm" wrap="nowrap">
//             <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue"
//               style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
//               <FileIcon size={20} />
//             </Paper>
//             <div style={{ minWidth: 0 }}>
//               <Text fw={600} lineClamp={1}>{file.originalName}</Text>
//               <Text fz="xs" c="dimmed">{file.mimeType}</Text>
//             </div>
//           </Group>

//           <SimpleGrid cols={2}>
//             <Detail label="Size" value={formatFileSize(file.sizeBytes)} />
//             <Detail label="Expires" value={file.expiresAt?.split("T")[0] ?? ""} />
//             <Detail label="Encrypted" value={file.isEncrypted ? "Yes" : "No"} />
//             <Detail label="Downloads" value={String(file.downloadCount ?? 0)} />
//           </SimpleGrid>

//           <Paper withBorder radius="md" p="md" bg="var(--mantine-color-gray-0)">
//             <Group gap={8} wrap="nowrap" align="flex-start">
//               <ShieldCheck size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
//               <Text fz="xs" c="dimmed">
//                 Locked on the sender's device. Deleted automatically after 1 day or 10 downloads.
//               </Text>
//             </Group>
//           </Paper>
//         </Stack>

//         {/* RIGHT: action card + context-aware info */}
//         <Stack gap="md">
//           <Paper withBorder radius="md" p="md">
//             {file.isEncrypted ? (
//               // ENCRYPTED: Show password field
//               <Stack gap="sm">
//                 <Group gap={6}>
//                   <Lock size={14} style={{ color: "var(--mantine-color-brand-6)" }} />
//                   <Text fz="sm" fw={700}>This file is locked</Text>
//                 </Group>
//                 <Text fz="xs" c="dimmed">
//                   Enter the password the sender shared with you.
//                 </Text>
//                 {autoFilled && !unlockError && (
//                   <Text fz="xs" c="green">Password auto-filled from your link.</Text>
//                 )}
//                 <PasswordInput
//                   label="Password"
//                   placeholder="Enter password to unlock"
//                   value={password}
//                   error={unlockError ?? undefined}
//                   onChange={(e) => { setPassword(e.currentTarget.value); setUnlockError(null); }}
//                   disabled={lockoutSeconds > 0}
//                 />

//                 {inlineMessage && (
//                   <Text fz="xs" c={lockoutSeconds > 0 ? "red" : "orange"} fw={500}>
//                     {inlineMessage}
//                   </Text>
//                 )}
//                 {attemptsLeft < 5 && lockoutSeconds === 0 && (
//                   <Text fz="xs" c="dimmed">{attemptsLeft} of 5 attempts remaining.</Text>
//                 )}

//                 <Button
//                   fullWidth
//                   size="md"
//                   loading={downloading}
//                   onClick={handleDownload}
//                   disabled={lockoutSeconds > 0}
//                   leftSection={<Lock size={16} />}
//                 >
//                   {lockoutSeconds > 0
//                     ? `Locked (${formatSeconds(lockoutSeconds)})`
//                     : downloading && dlProgress !== null
//                       ? `Downloading... ${dlProgress}%`
//                       : "Unlock and download"}
//                 </Button>
//               </Stack>
//             ) : (
//               // NON-ENCRYPTED: Simple download with helpful context
//               <Stack gap="md">
//                 <Group gap={6}>
//                   <DownloadIcon size={14} style={{ color: "var(--mantine-color-brand-6)" }} />
//                   <Text fz="sm" fw={700}>Ready to download</Text>
//                 </Group>
//                 <Text fz="xs" c="dimmed">
//                   This file is not encrypted. Click below to download it directly to your device.
//                 </Text>
//                 <Button 
//                   fullWidth 
//                   size="md" 
//                   loading={downloading} 
//                   onClick={handleDownload}
//                   leftSection={<DownloadIcon size={16} />}
//                 >
//                   {downloading && dlProgress !== null ? `Downloading... ${dlProgress}%` : "Download"}
//                 </Button>
//               </Stack>
//             )}

//             {downloading && dlProgress !== null && (
//               <>
//                 <Progress value={dlProgress} size={6} radius="xl" color="var(--mantine-color-blue-6)" mt={6} />
//                 {dlSlow && (
//                   <Text fz="xs" c="dimmed" mt={4}>Large file or slow connection. Hang tight, it's working.</Text>
//                 )}
//               </>
//             )}
//           </Paper>

//           {/* Context-aware info card - different for encrypted vs non-encrypted */}
//           <Paper withBorder radius="md" p="md">
//             <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb={6}>Good to know</Text>
//             <Stack gap={8}>
//               {file.isEncrypted && (
//                 <Group gap={8} wrap="nowrap" align="flex-start">
//                   <Lock size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
//                   <Text fz="xs" c="dimmed">The password never reaches us. Unlocking happens on your device.</Text>
//                 </Group>
//               )}
//               <Group gap={8} wrap="nowrap" align="flex-start">
//                 <Clock size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
//                 <Text fz="xs" c="dimmed">The link dies after its expiry date or download count, whichever comes first.</Text>
//               </Group>
//               <Group gap={8} wrap="nowrap" align="flex-start">
//                 <ShieldCheck size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
//                 <Text fz="xs" c="dimmed">Nothing is saved on your device until the download finishes.</Text>
//               </Group>
//             </Stack>
//           </Paper>
//         </Stack>
//       </SimpleGrid>
//     </Box>
//   </Card>
// )}
//     </Container>
//   );
// }

// export default DownloadPage;



// ============================================================
// DownloadPage - THE RECIPIENT'S VIEW (WITH DEV LOGGER)
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Box, Button, Card, Container, Group, Paper, PasswordInput, Progress,
  SimpleGrid, Skeleton, Stack, Switch, Text, Title,
} from "@mantine/core";
import { Clock, Download as DownloadIcon, File as FileIcon, Lock, ShieldCheck } from "lucide-react";
import { Illustration } from "../components/Illustration";
import { LinkExpiredCard } from "../components/download/LinkExpiredCard";
import { ConnectionLostCard } from "../components/download/ConnectionLostCard";
import { DownloadCompleteCard } from "../components/download/DownloadCompleteCard";
import { fetchFileMetadata, requestDownloadUrl, ApiError } from "../lib/api";
import { downloadBlobWithProgress, triggerDownloadFromBlob, triggerDownloadFromArrayBuffer } from "../lib/download";
import { decryptFileAuto } from "../lib/crypto";
import { revealInstallPrompt } from "../lib/pwa"; 

interface FileMetadata {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isEncrypted: boolean;
  expiresAt: string;
  downloadCount: number;
  lockRemainingSeconds?: number;
}

type ErrorKind = "network" | "server" | "expired";
type DevEvent = { timestamp: string; message: string; level: "info" | "warn" | "error" };

function classifyError(err: unknown): ErrorKind {
  const e = err as { response?: { status?: number }; code?: string; message?: string };
  const status = e?.response?.status;
  if (status === 404 || status === 410) return "expired";
  if (status && status >= 500) return "server";
  const msg = `${e?.message ?? ""} ${e?.code ?? ""}`;
  if (/404|410|expired|not found|no such/i.test(msg)) return "expired";
  if (!status && /network|fetch|offline|connection|econn|enotfound|timeout/i.test(msg)) return "network";
  if (!status && typeof navigator !== "undefined" && !navigator.onLine) return "network";
  return "server";
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text fz={10} c="dimmed" tt="uppercase" fw={600}>{label}</Text>
      <Text fz="sm" fw={500} mt={2}>{value}</Text>
    </div>
  );
}

export function DownloadPage() {
  const { token } = useParams<{ token: string }>();

  const hashPassword = (() => {
    const h = typeof window !== "undefined" ? window.location.hash : "";
    return h && h.length > 1 ? decodeURIComponent(h.slice(1)) : "";
  })();
  const hashAutoFilled = hashPassword.length > 0;

  const [file, setFile] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!token);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(token ? null : "expired");
  const [attempt, setAttempt] = useState(0);
  const [password, setPassword] = useState(hashPassword);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [dlProgress, setDlProgress] = useState<number | null>(null);
  const [dlSlow, setDlSlow] = useState(false);
  const [autoFilled] = useState(hashAutoFilled);

  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [inlineMessage, setInlineMessage] = useState("");

  // 🛠️ DEV LOGGER STATES
  const [events, setEvents] = useState<DevEvent[]>([]);
  const [showDeveloperDetails, setShowDeveloperDetails] = useState(false);

  const dlStartRef = useRef(0);

  // 🛠️ DEV LOGGER FUNCTION
  const logDevEvent = useCallback((message: string, level: "info" | "warn" | "error" = "info") => {
    if (!import.meta.env.DEV) return;
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;
    setEvents((prev) => [...prev.slice(-49), { timestamp, message, level }]);
  }, []);

  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setInterval(() => setLockoutSeconds((s) => s - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutSeconds]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    if (downloading) window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [downloading]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    
    fetchFileMetadata(token)
      .then((data) => {
        if (!cancelled) { 
          logDevEvent(`Fetching metadata for token: ${token.slice(0, 8)}...`);
          setFile(data); setErrorKind(null); setLoading(false);
          logDevEvent(`Metadata received. Encrypted: ${data.isEncrypted}, Size: ${formatFileSize(data.sizeBytes)}`);
          if (data.lockRemainingSeconds && data.lockRemainingSeconds > 0) {
            setLockoutSeconds(data.lockRemainingSeconds);
            setInlineMessage("Too many wrong tries on this device. This link is resting for a bit.");
            logDevEvent(`Penalty box active. Lockout: ${data.lockRemainingSeconds}s`, "warn");
          }
        }
      })
      .catch((err) => {
        if (!cancelled) { 
          const kind = classifyError(err);
          setErrorKind(kind); 
          setLoading(false); 
          logDevEvent(`Metadata fetch failed: ${kind}`, "error");
        }
      });
    return () => { cancelled = true; };
  }, [token, attempt, logDevEvent]);

  useEffect(() => {
    if (window.location.hash && window.location.hash.length > 1) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    if (complete) {
      revealInstallPrompt();
    }
  }, [complete]);

  const retry = () => { 
    setLoading(true); 
    setErrorKind(null); 
    setAttempt((a) => a + 1); 
    logDevEvent("User triggered manual retry.");
  };

  const handleDownload = async () => {
    if (!token || !file) return;
    if (lockoutSeconds > 0) return; 
    if (file.isEncrypted && !password) {
      setUnlockError("Enter the password first.");
      return;
    }
    if (!navigator.onLine) { toast.error("You're offline. Check your internet and try again."); return; }

    logDevEvent("Download initiated. Requesting secure URL from backend...");
    setDownloading(true); setDlProgress(0); setDlSlow(false); setUnlockError(null);
    dlStartRef.current = Date.now();
    
    const onProg = (p: number | null) => {
      if (p !== null) {
        setDlProgress(p);
        if (Date.now() - dlStartRef.current > 5000 && p < 90) setDlSlow(true);
      }
    };

    try {
      const d = await requestDownloadUrl(token, file.isEncrypted ? password : undefined);
      logDevEvent("Backend verified. Received presigned S3 URL.");
      
      logDevEvent("Downloading bytes from S3...");
      const blob = await downloadBlobWithProgress(d.downloadUrl, onProg);
      logDevEvent("S3 download complete.");

      if (!d.isEncrypted) {
        logDevEvent("File is plain. Triggering browser download.");
        triggerDownloadFromBlob(blob, d.originalName);
        toast.success("Download started");
      } else {
        if (!d.salt || !d.iv) throw new Error("Missing encryption parameters");
        logDevEvent("File is encrypted. Decrypting in browser memory...", "warn");
        const data = await blob.arrayBuffer();
        const decrypted = await decryptFileAuto(data, password, d.salt, d.iv, d.sizeBytes);
        logDevEvent("Decryption successful. Triggering browser download.");
        triggerDownloadFromArrayBuffer(decrypted, d.originalName, d.mimeType);
        toast.success("File decrypted");
      }
      setComplete(true);
      logDevEvent("Download flow finished successfully.");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "INVALID_PASSWORD") {
          logDevEvent(`Backend rejected password. Attempts left: ${err.attemptsLeft ?? 0}`, "error");
          const left = err.attemptsLeft ?? 0;
          setAttemptsLeft(left);

          if (left === 4) setInlineMessage("Hmm, that didn't match. Passwords here are case-sensitive, so it's worth a second look");
          else if (left === 3) setInlineMessage("Still no luck. If the sender messaged you the password, copying it straight from their message usually does the trick");
          else if (left === 2) setInlineMessage("That's three misses. Two tries left before the link locks for 10 minutes — no rush, take a breath");
          else if (left === 1) setInlineMessage("One try left. If this doesn't match, the link locks for 10 minutes to keep the file safe. When in doubt, ask the sender to re-send the password");
          else {
            setInlineMessage("Too many wrong guesses, so this link is resting for 10 minutes. The countdown shows when it wakes up — and a quick message to the sender will save you the wait");
          }
          toast.error(`Incorrect password. ${left} attempt${left === 1 ? "" : "s"} remaining.`);
        } else if (err.code === "TOO_MANY_ATTEMPTS" || err.code === "DOWNLOAD_LOCKED") {
          logDevEvent(`Penalty box triggered by backend. Lockout: ${err.retryAfterSeconds ?? 600}s`, "error");
          setAttemptsLeft(0);
          setLockoutSeconds(err.retryAfterSeconds ?? 600);
          setInlineMessage("Too many wrong tries. This link is taking a nap to protect the file.");
          toast.error("Too many failed attempts. Locked for 10 minutes.");
        } else {
          logDevEvent(`API Error: ${err.code} - ${err.message}`, "error");
          toast.error(err.message);
        }
      } else {
        logDevEvent(`Unexpected Error: ${err instanceof Error ? err.message : "Unknown"}`, "error");
        toast.error(err instanceof Error ? err.message : "Download failed");
      }
    } finally {
      setDownloading(false);
      setDlProgress(null);
    }
  };

  return (
    <Container size="md" py={{ base: "md", sm: "xl" }}>
      
      {/* 🛠️ DEV MODE TOGGLE */}
      {import.meta.env.DEV && (
        <Paper withBorder p="xs" mb="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed">Sendly Download developer mode</Text>
            <Switch size="xs" label="Show technical details" checked={showDeveloperDetails} onChange={(event) => setShowDeveloperDetails(event.currentTarget.checked)} />
          </Group>
        </Paper>
      )}

      {loading && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="md">
              <Skeleton height={160} radius="md" />
              <Group gap="sm" wrap="nowrap">
                <Skeleton height={40} width={40} radius="md" />
                <Stack gap={8} style={{ flex: 1 }}>
                  <Skeleton height={12} width="55%" />
                  <Skeleton height={10} width="35%" />
                </Stack>
              </Group>
            </Stack>
            <Stack gap="md">
              <Skeleton height={120} radius="md" />
              <Skeleton height={140} radius="md" />
            </Stack>
          </SimpleGrid>
        </Card>
      )}

      {!loading && errorKind === "network" && <ConnectionLostCard variant="network" onRetry={retry} />}
      {!loading && errorKind === "server" && <ConnectionLostCard variant="server" onRetry={retry} />}
      {!loading && errorKind === "expired" && <LinkExpiredCard />}

      {!loading && !errorKind && complete && (
        <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
          <DownloadCompleteCard />
        </Card>
      )}

      {!loading && !errorKind && file && !complete && (
        <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
          <Group p="md" gap="sm">
            <Paper w={40} h={40} radius="md" bg="var(--mantine-color-brand-light)" c="brand"
              style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
              <DownloadIcon size={20} />
            </Paper>
            <div>
              <Title order={3}>Download files</Title>
              <Text fz="xs" c="dimmed">Shared securely with Sendly</Text>
            </div>
          </Group>

          <Box p={{ base: "md", sm: "xl" }} style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              <Stack gap="md">
                <Illustration src="/illustrations/download.svg" alt="Downloading a file" maxWidth={220} />
                <Group gap="sm" wrap="nowrap">
                  <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue"
                    style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <FileIcon size={20} />
                  </Paper>
                  <div style={{ minWidth: 0 }}>
                    <Text fw={600} lineClamp={1}>{file.originalName}</Text>
                    <Text fz="xs" c="dimmed">{file.mimeType}</Text>
                  </div>
                </Group>
                <SimpleGrid cols={2}>
                  <Detail label="Size" value={formatFileSize(file.sizeBytes)} />
                  <Detail label="Expires" value={file.expiresAt?.split("T")[0] ?? ""} />
                  <Detail label="Encrypted" value={file.isEncrypted ? "Yes" : "No"} />
                  <Detail label="Downloads" value={String(file.downloadCount ?? 0)} />
                </SimpleGrid>
                <Paper withBorder radius="md" p="md" bg="var(--mantine-color-gray-0)">
                  <Group gap={8} wrap="nowrap" align="flex-start">
                    <ShieldCheck size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
                    <Text fz="xs" c="dimmed">
                      Locked on the sender's device. Deleted automatically after 1 day or 10 downloads.
                    </Text>
                  </Group>
                </Paper>
              </Stack>

              <Stack gap="md">
                <Paper withBorder radius="md" p="md">
                  {file.isEncrypted ? (
                    <Stack gap="sm">
                      <Group gap={6}>
                        <Lock size={14} style={{ color: "var(--mantine-color-brand-6)" }} />
                        <Text fz="sm" fw={700}>This file is locked</Text>
                      </Group>
                      <Text fz="xs" c="dimmed">Enter the password the sender shared with you.</Text>
                      {autoFilled && !unlockError && (
                        <Text fz="xs" c="green">Password auto-filled from your link.</Text>
                      )}
                      <PasswordInput
                        label="Password"
                        placeholder="Enter password to unlock"
                        value={password}
                        error={unlockError ?? undefined}
                        onChange={(e) => { setPassword(e.currentTarget.value); setUnlockError(null); }}
                        disabled={lockoutSeconds > 0}
                      />
                      {inlineMessage && (
                        <Text fz="xs" c={lockoutSeconds > 0 ? "red" : "orange"} fw={500}>
                          {inlineMessage}
                        </Text>
                      )}
                      {attemptsLeft < 5 && lockoutSeconds === 0 && (
                        <Text fz="xs" c="dimmed">{attemptsLeft} of 5 attempts remaining.</Text>
                      )}
                      <Button
                        fullWidth
                        size="md"
                        loading={downloading}
                        onClick={handleDownload}
                        disabled={lockoutSeconds > 0}
                        leftSection={<Lock size={16} />}
                      >
                        {lockoutSeconds > 0
                          ? `Locked (${formatSeconds(lockoutSeconds)})`
                          : downloading && dlProgress !== null
                            ? `Downloading... ${dlProgress}%`
                            : "Unlock and download"}
                      </Button>
                    </Stack>
                  ) : (
                    <Stack gap="md">
                      <Group gap={6}>
                        <DownloadIcon size={14} style={{ color: "var(--mantine-color-brand-6)" }} />
                        <Text fz="sm" fw={700}>Ready to download</Text>
                      </Group>
                      <Text fz="xs" c="dimmed">This file is not encrypted. Click below to download it directly to your device.</Text>
                      <Button 
                        fullWidth 
                        size="md" 
                        loading={downloading} 
                        onClick={handleDownload}
                        leftSection={<DownloadIcon size={16} />}
                      >
                        {downloading && dlProgress !== null ? `Downloading... ${dlProgress}%` : "Download"}
                      </Button>
                    </Stack>
                  )}

                  {downloading && dlProgress !== null && (
                    <>
                      <Progress value={dlProgress} size={6} radius="xl" color="var(--mantine-color-blue-6)" mt={6} />
                      {dlSlow && (
                        <Text fz="xs" c="dimmed" mt={4}>Large file or slow connection. Hang tight, it's working.</Text>
                      )}
                    </>
                  )}
                </Paper>

                <Paper withBorder radius="md" p="md">
                  <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb={6}>Good to know</Text>
                  <Stack gap={8}>
                    {file.isEncrypted && (
                      <Group gap={8} wrap="nowrap" align="flex-start">
                        <Lock size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
                        <Text fz="xs" c="dimmed">The password never reaches us. Unlocking happens on your device.</Text>
                      </Group>
                    )}
                    <Group gap={8} wrap="nowrap" align="flex-start">
                      <Clock size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
                      <Text fz="xs" c="dimmed">The link dies after its expiry date or download count, whichever comes first.</Text>
                    </Group>
                    <Group gap={8} wrap="nowrap" align="flex-start">
                      <ShieldCheck size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
                      <Text fz="xs" c="dimmed">Nothing is saved on your device until the download finishes.</Text>
                    </Group>
                  </Stack>
                </Paper>
              </Stack>
            </SimpleGrid>
          </Box>
        </Card>
      )}

      {/* 🛠️ DEV LOGGER TIMELINE PANEL */}
      {import.meta.env.DEV && showDeveloperDetails && events.length > 0 && (
        <Paper withBorder p="sm" mt="md" style={{ maxHeight: 280, overflowY: "auto" }}>
          <Text fz="xs" fw={700}>Developer timeline (Download Flow)</Text>
          {events.map((event, index) => (
            <Text size="xs" key={`${index}-${event.timestamp}-${event.message}`} c={event.level === "error" ? "red" : event.level === "warn" ? "orange" : "dimmed"}>
              {event.timestamp} — {event.message}
            </Text>
          ))}
        </Paper>
      )}
    </Container>
  );
}

export default DownloadPage;