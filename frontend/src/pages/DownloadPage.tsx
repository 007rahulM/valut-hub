
// // ============================================================

// import { useEffect, useRef, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import toast from "react-hot-toast";
// import { Box, Button, Card, Container, Group, Loader, Paper, PasswordInput, Progress, SimpleGrid, Stack, Text, Title } from "@mantine/core";
// import { Download as DownloadIcon, Lock, ShieldCheck } from "lucide-react";
// import { Illustration } from "../components/Illustration";
// import { InfoBanner } from "../components/InfoBanner";
// import { LinkExpiredCard } from "../components/download/LinkExpiredCard";
// import { ConnectionLostCard } from "../components/download/ConnectionLostCard";
// import { fetchFileMetadata, requestDownloadUrl } from "../lib/api";
// import { downloadBlobWithProgress, triggerDownloadFromBlob, triggerDownloadFromArrayBuffer } from "../lib/download";
// import { decryptFile } from "../lib/crypto";
// import { DownloadCompleteCard } from "../components/download/DownloadCompleteCard";

// // ============================================================
// // TYPES: Shape of file metadata from backend
// // ============================================================
// interface FileMetadata {
//   originalName: string;
//   mimeType: string;
//   sizeBytes: number;
//   isEncrypted: boolean;
//   expiresAt: string;
//   downloadCount: number;
// }

// // ============================================================
// // ERROR CLASSIFICATION: Figure out WHAT failed so we show the RIGHT card
// // ============================================================
// type ErrorKind = "network" | "server" | "expired";

// function classifyError(err: unknown): ErrorKind {
//   const e = err as { response?: { status?: number }; code?: string; message?: string };
//   const status = e?.response?.status;

//   // 404/410 from backend = link expired, used up, or never existed
//   if (status === 404 || status === 410) return "expired";

//   // 5xx from backend = our server problem (retry-able)
//   if (status && status >= 500) return "server";

//   const msg = `${e?.message ?? ""} ${e?.code ?? ""}`;

//   // Check error message for "expired" keywords
//   if (/404|410|expired|not found|no such/i.test(msg)) return "expired";

//   // No status code + network keywords = user's internet problem (retry-able)
//   if (!status && /network|fetch|offline|connection|econn|enotfound|timeout/i.test(msg)) return "network";

//   // Browser says we're offline
//   if (!status && typeof navigator !== "undefined" && !navigator.onLine) return "network";

//   // Fallback: assume server problem
//   return "server";
// }

// // ============================================================
// // HELPERS
// // ============================================================

// // Human-readable file size (430.25 KB, 2.2 MB, ...)
// function formatFileSize(bytes: number): string {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
// }

// // Tiny label/value pair used in the SIZE / EXPIRES / ENCRYPTED / DOWNLOADS grid
// function Detail({ label, value }: { label: string; value: string }) {
//   return (
//     <div>
//       <Text fz={10} c="dimmed" tt="uppercase" fw={600}>{label}</Text>
//       <Text fz="sm" fw={500} mt={2}>{value}</Text>
//     </div>
//   );
// }

// // ============================================================
// // MAIN COMPONENT
// // ============================================================
// export function DownloadPage() {
//   // Get the token from the URL (e.g., /file/abc123 → token = "abc123")
//   const { token } = useParams<{ token: string }>();

//   // ============================================================
//   // STATE: What's happening right now
//   // ============================================================
//   const [file, setFile] = useState<FileMetadata | null>(null); // File metadata from backend
//   const [loading, setLoading] = useState<boolean>(() => !!token); // Start loading if we have a token
//   const [errorKind, setErrorKind] = useState<ErrorKind | null>(token ? null : "expired"); // What went wrong (if anything)
//   const [attempt, setAttempt] = useState(0); // Increment to retry fetch
//   const [password, setPassword] = useState(""); // User's password input (for encrypted files)
//   const [unlocked, setUnlocked] = useState(false); // Did they click "Unlock"?
//   const [downloading, setDownloading] = useState(false); // Is the download in progress?
//   const [complete, setComplete] = useState(false); // Did the download finish successfully?

//   // Download progress tracking (what your users asked for)
//   const [dlProgress, setDlProgress] = useState<number | null>(null); // 0-100 percentage
//   const [dlSlow, setDlSlow] = useState(false); // Should we show "slow connection" message?
//   const dlStartRef = useRef(0); // Timestamp when download started (to detect slowness)

//   // ============================================================
//   // EFFECT: Fetch file metadata when the page loads
//   // ============================================================
//   useEffect(() => {
//     if (!token) return; // No token = show expired card immediately
//     let cancelled = false; // Ignore results if user leaves mid-fetch

//     fetchFileMetadata(token)
//       .then((data) => {
//         if (!cancelled) {
//           setFile(data);        // Valid link → show the download UI
//           setErrorKind(null);
//           setLoading(false);
//         }
//       })
//       .catch((err) => {
//         if (!cancelled) {
//           setErrorKind(classifyError(err)); // Decide WHICH error card to show
//           setLoading(false);
//         }
//       });

//     return () => { cancelled = true; }; // Cleanup: ignore late results
//   }, [token, attempt]); // Re-run when token or attempt changes

//   // "Try again" button on the Connection Lost card
//   const retry = () => {
//     setLoading(true);
//     setErrorKind(null);
//     setAttempt((a) => a + 1); // Increment attempt → effect re-runs
//   };

//   // ============================================================
//   // DOWNLOAD HANDLER: User clicked "Download"
//   // ============================================================
//   const handleDownload = async () => {
//     if (!token || !file) return;

//     // Fail fast if the device is already offline
//     if (!navigator.onLine) {
//       toast.error("You're offline — check your internet and try again.");
//       return;
//     }

//     setDownloading(true);
//     setDlProgress(0);
//     setDlSlow(false);
//     dlStartRef.current = Date.now();

//     // Progress callback: update percentage + detect slowness
//     const onProg = (p: number | null) => {
//       if (p !== null) {
//         setDlProgress(p);
//         // If 5 seconds passed and we're still below 90%, it's slow
//         if (Date.now() - dlStartRef.current > 5000 && p < 90) setDlSlow(true);
//       }
//     };

//     try {
//       // STEP 1: Ask backend for a presigned S3 download URL
//       const d = await requestDownloadUrl(token, file.isEncrypted ? password : undefined);

//       // STEP 2: Download the file with progress tracking
//       const blob = await downloadBlobWithProgress(d.downloadUrl, onProg);

//       if (!d.isEncrypted) {
//         // Plain file → save blob to disk
//         triggerDownloadFromBlob(blob, d.originalName);
//         toast.success("Download started!");
//       } else {
//         // Encrypted file → decrypt first, then save
//         if (!d.salt || !d.iv) throw new Error("Missing encryption parameters");
//         const data = await blob.arrayBuffer();
//         const decrypted = await decryptFile(data, password, d.salt, d.iv);
//         triggerDownloadFromArrayBuffer(decrypted, d.originalName, d.mimeType);
//         toast.success("File decrypted!");
//       }

//       setComplete(true); // Show the DownloadCompleteCard
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : "Download failed");
//       setUnlocked(false); // Let them re-enter the password and retry
//     } finally {
//       setDownloading(false);
//       setDlProgress(null);
//     }
//   };

//   // ============================================================
//   // RENDER: Show the right card based on current state
//   // ============================================================
//   return (
//     <Container size="xs" py="xl">
//       {/* ---------- LOADING ---------- */}
//       {loading && (
//         <Card withBorder shadow="sm" radius="lg" p="xl">
//           <Stack align="center" gap="md">
//             <Loader color="var(--mantine-color-brand-6)" />
//             <Text fz="sm" c="dimmed">Loading file...</Text>
//           </Stack>
//         </Card>
//       )}

//       {/* ---------- INTERNET / SERVER PROBLEM (retry-able) ---------- */}
//       {!loading && errorKind === "network" && (
//         <ConnectionLostCard variant="network" onRetry={retry} />
//       )}
//       {!loading && errorKind === "server" && (
//         <ConnectionLostCard variant="server" onRetry={retry} />
//       )}

//       {/* ---------- EXPIRED / USED UP / NEVER EXISTED (permanent) ---------- */}
//       {!loading && errorKind === "expired" && <LinkExpiredCard />}

//       {/* ---------- DOWNLOAD COMPLETE ---------- */}
//       {!loading && !errorKind && complete && (
//         <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
//           <DownloadCompleteCard />
//         </Card>
//       )}

//       {/* ---------- MAIN DOWNLOAD UI ---------- */}
//       {!loading && !errorKind && file && !complete && (
//         <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
//           {/* Brand-orange banner */}
//           <Box bg="var(--mantine-color-brand-filled)" p="md">
//             <Group>
//               <DownloadIcon color="white" size={20} />
//               <div>
//                 <Title order={3} c="white">Download files</Title>
//                 <Text fz="xs" c="white">Shared securely with VaultHub</Text>
//               </div>
//             </Group>
//           </Box>

//           <Stack gap="md" p="xl">
//             <Illustration src="/illustrations/download.svg" alt="Downloading a file" maxWidth={200} />

//             {/* File identity row */}
//             <Group gap="sm" wrap="nowrap">
//               <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue"
//                 style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
//                 <DownloadIcon size={20} />
//               </Paper>
//               <div style={{ minWidth: 0 }}>
//                 <Text fw={600} lineClamp={1}>{file.originalName}</Text>
//                 <Text fz="xs" c="dimmed">{file.mimeType}</Text>
//               </div>
//             </Group>

//             {/* The facts grid */}
//             <SimpleGrid cols={2}>
//               <Detail label="Size" value={formatFileSize(file.sizeBytes)} />
//               <Detail label="Expires" value={file.expiresAt?.split("T")[0] ?? ""} />
//               <Detail label="Encrypted" value={file.isEncrypted ? "Yes" : "No"} />
//               <Detail label="Downloads" value={String(file.downloadCount ?? 0)} />
//             </SimpleGrid>

//             {/* Encrypted? Ask for the password first */}
//             {file.isEncrypted && !unlocked && (
//               <Stack gap="sm">
//                 <InfoBanner>
//                   This file is locked. Enter the password the sender shared with you —
//                   we never store it and can't recover it.
//                 </InfoBanner>
//                 <Text fz="sm" fw={500}>
//                   <Lock size={14} style={{ verticalAlign: -2 }} /> Password required
//                 </Text>
//                 <PasswordInput
//                   label="Password"
//                   placeholder="Enter password to unlock"
//                   value={password}
//                   onChange={(e) => setPassword(e.currentTarget.value)}
//                 />
//                 <Button fullWidth disabled={!password} onClick={() => setUnlocked(true)}>Unlock</Button>
//               </Stack>
//             )}

//             {/* Unlocked (or not encrypted) → the real Download button */}
//             {(!file.isEncrypted || unlocked) && (
//               <Stack gap="xs">
//                 <Button fullWidth size="md" loading={downloading} onClick={handleDownload}
//                   leftSection={<DownloadIcon size={16} />}>
//                   {downloading && dlProgress !== null ? `Downloading… ${dlProgress}%` : "Download"}
//                 </Button>

//                 {downloading && dlProgress !== null && (
//                   <>
//                     <Progress value={dlProgress} animated size="sm" radius="md" color="brand" mt={4} />
//                     {dlSlow && (
//                       <Text fz="xs" c="dimmed">Large file or slow connection — hang tight, it's working.</Text>
//                     )}
//                   </>
//                 )}

//                 {file.isEncrypted && (
//                   <Button variant="subtle" size="xs" color="gray"
//                     onClick={() => { setUnlocked(false); setPassword(""); }}>
//                     Wrong password? Try again
//                   </Button>
//                 )}
//               </Stack>
//             )}
//           </Stack>

//           {/* Factual footer strip */}
//           <Box p="md" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
//             <Text fz="xs" c="dimmed">
//               <ShieldCheck size={14} style={{ verticalAlign: -2 }} /> Locked on the sender's device • deleted automatically after 1 day or 10 downloads
//             </Text>
//           </Box>
//         </Card>
//       )}
//     </Container>
//   );
// }

// export default DownloadPage;



// ============================================================
// DownloadPage — THE RECIPIENT'S VIEW
//
// FLOW (state machine):
//   loading  → skeleton card that mirrors the real layout
//   network  → ConnectionLostCard("You're offline") + Try again
//   server   → ConnectionLostCard("We'll be right back") + Try again
//   expired  → LinkExpiredCard (permanent — file is gone)
//   complete → DownloadCompleteCard (green strip + ⭐ feedback)
//   else     → main card: banner → illustration → file facts →
//               unlock (if encrypted) → Download + live progress
//
// Expiry is enforced by the BACKEND (404/410). We only display it.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Box, Button, Card, Container, Group, Paper, PasswordInput, Progress,
  SimpleGrid, Skeleton, Stack, Text, Title,
} from "@mantine/core";
import { Download as DownloadIcon, Lock, ShieldCheck } from "lucide-react";
import { Illustration } from "../components/Illustration";
import { InfoBanner } from "../components/InfoBanner";
import { LinkExpiredCard } from "../components/download/LinkExpiredCard";
import { ConnectionLostCard } from "../components/download/ConnectionLostCard";
import { DownloadCompleteCard } from "../components/download/DownloadCompleteCard";
import { fetchFileMetadata, requestDownloadUrl } from "../lib/api";
import { downloadBlobWithProgress, triggerDownloadFromBlob, triggerDownloadFromArrayBuffer } from "../lib/download";
import { decryptFile } from "../lib/crypto";

// Shape of the metadata the backend returns for a valid token
interface FileMetadata {
  originalName: string; mimeType: string; sizeBytes: number;
  isEncrypted: boolean; expiresAt: string; downloadCount: number;
}

// The 3 failure families → which card we show
type ErrorKind = "network" | "server" | "expired";

function classifyError(err: unknown): ErrorKind {
  const e = err as { response?: { status?: number }; code?: string; message?: string };
  const status = e?.response?.status;
  if (status === 404 || status === 410) return "expired";       // gone forever
  if (status && status >= 500) return "server";                 // our fault, retry-able
  const msg = `${e?.message ?? ""} ${e?.code ?? ""}`;
  if (/404|410|expired|not found|no such/i.test(msg)) return "expired";
  if (!status && /network|fetch|offline|connection|econn|enotfound|timeout/i.test(msg)) return "network";
  if (!status && typeof navigator !== "undefined" && !navigator.onLine) return "network";
  return "server";
}

// Human-readable size (2.2 MB, 430.25 KB…)
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// One label/value cell in the facts grid
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text fz={10} c="dimmed" tt="uppercase" fw={600}>{label}</Text>
      <Text fz="sm" fw={500} mt={2}>{value}</Text>
    </div>
  );
}

export function DownloadPage() {
  const { token } = useParams<{ token: string }>(); // /file/abc123 → "abc123"

  const [file, setFile] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!token);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(token ? null : "expired");
  const [attempt, setAttempt] = useState(0);        // bump to retry
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [dlProgress, setDlProgress] = useState<number | null>(null);
  const [dlSlow, setDlSlow] = useState(false);
  const dlStartRef = useRef(0);

  // Fetch metadata on open; classify failures into the right card
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchFileMetadata(token)
      .then((data) => { if (!cancelled) { setFile(data); setErrorKind(null); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setErrorKind(classifyError(err)); setLoading(false); } });
    return () => { cancelled = true; };
  }, [token, attempt]);

  const retry = () => { setLoading(true); setErrorKind(null); setAttempt((a) => a + 1); };

  // Download button: presigned URL → blob (with progress) → decrypt if needed → save
  const handleDownload = async () => {
    if (!token || !file) return;
    if (!navigator.onLine) { toast.error("You're offline — check your internet and try again."); return; }

    setDownloading(true); setDlProgress(0); setDlSlow(false);
    dlStartRef.current = Date.now();
    const onProg = (p: number | null) => {
      if (p !== null) {
        setDlProgress(p);
        if (Date.now() - dlStartRef.current > 5000 && p < 90) setDlSlow(true);
      }
    };

    try {
      const d = await requestDownloadUrl(token, file.isEncrypted ? password : undefined);
      const blob = await downloadBlobWithProgress(d.downloadUrl, onProg);

      if (!d.isEncrypted) {
        triggerDownloadFromBlob(blob, d.originalName);
        toast.success("Download started!");
      } else {
        if (!d.salt || !d.iv) throw new Error("Missing encryption parameters");
        const data = await blob.arrayBuffer();
        const decrypted = await decryptFile(data, password, d.salt, d.iv);
        triggerDownloadFromArrayBuffer(decrypted, d.originalName, d.mimeType);
        toast.success("File decrypted!");
      }
      setComplete(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
      setUnlocked(false);
    } finally {
      setDownloading(false);
      setDlProgress(null);
    }
  };

  return (
    <Container size="xs" py={{ base: "md", sm: "xl" }}>
      {/* ---------- LOADING: skeleton that mirrors the real card ---------- */}
      {loading && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
          <Stack gap="md">
            <Group gap="sm" wrap="nowrap">
              <Skeleton height={40} width={40} radius="md" />
              <Stack gap={8} style={{ flex: 1 }}>
                <Skeleton height={12} width="55%" />
                <Skeleton height={10} width="35%" />
              </Stack>
            </Group>
            <SimpleGrid cols={2} spacing="sm">
              <Skeleton height={38} /><Skeleton height={38} />
              <Skeleton height={38} /><Skeleton height={38} />
            </SimpleGrid>
            <Skeleton height={44} radius="md" />
          </Stack>
        </Card>
      )}

      {/* ---------- FAILURE CARDS ---------- */}
      {!loading && errorKind === "network" && <ConnectionLostCard variant="network" onRetry={retry} />}
      {!loading && errorKind === "server" && <ConnectionLostCard variant="server" onRetry={retry} />}
      {!loading && errorKind === "expired" && <LinkExpiredCard />}

      {/* ---------- SUCCESS ---------- */}
      {!loading && !errorKind && complete && (
        <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
          <DownloadCompleteCard />
        </Card>
      )}

      {/* ---------- MAIN DOWNLOAD UI ---------- */}
      {!loading && !errorKind && file && !complete && (
        <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
          {/* Brand banner: the only orange on this page (it's an action page) */}
          <Box bg="var(--mantine-color-brand-filled)" p="md">
            <Group>
              <DownloadIcon color="white" size={20} />
              <div>
                <Title order={3} c="white">Download files</Title>
                <Text fz="xs" c="white">Shared securely with VaultHub</Text>
              </div>
            </Group>
          </Box>

          <Stack gap="md" p={{ base: "md", sm: "xl" }}>
            <Illustration src="/illustrations/download.svg" alt="Downloading a file" maxWidth={200} />

            <Group gap="sm" wrap="nowrap">
              <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue"
                style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
                <DownloadIcon size={20} />
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

            {/* Encrypted → unlock first */}
            {file.isEncrypted && !unlocked && (
              <Stack gap="sm">
                <InfoBanner>
                  This file is locked. Enter the password the sender shared with you —
                  we never store it and can't recover it.
                </InfoBanner>
                <Text fz="sm" fw={500}>
                  <Lock size={14} style={{ verticalAlign: -2 }} /> Password required
                </Text>
                <PasswordInput
                  label="Password"
                  placeholder="Enter password to unlock"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />
                <Button fullWidth disabled={!password} onClick={() => setUnlocked(true)}>Unlock</Button>
              </Stack>
            )}

            {/* Unlocked / plain → download with live progress */}
            {(!file.isEncrypted || unlocked) && (
              <Stack gap="xs">
                <Button fullWidth size="md" loading={downloading} onClick={handleDownload}
                  leftSection={<DownloadIcon size={16} />}>
                  {downloading && dlProgress !== null ? `Downloading… ${dlProgress}%` : "Download"}
                </Button>

                {downloading && dlProgress !== null && (
                  <>
                    <Progress value={dlProgress} size={6} radius="xl"
                      color="var(--mantine-color-blue-6)" mt={4} />
                    {dlSlow && (
                      <Text fz="xs" c="dimmed">Large file or slow connection — hang tight, it's working.</Text>
                    )}
                  </>
                )}

                {file.isEncrypted && (
                  <Button variant="subtle" size="xs" color="gray"
                    onClick={() => { setUnlocked(false); setPassword(""); }}>
                    Wrong password? Try again
                  </Button>
                )}
              </Stack>
            )}
          </Stack>

          <Box p="md" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
            <Text fz="xs" c="dimmed">
              <ShieldCheck size={14} style={{ verticalAlign: -2 }} /> Locked on the sender's device • deleted automatically after 1 day or 10 downloads
            </Text>
          </Box>
        </Card>
      )}
    </Container>
  );
}

export default DownloadPage;