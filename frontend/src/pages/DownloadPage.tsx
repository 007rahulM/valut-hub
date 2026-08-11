
// // ============================================================
// // DownloadPage — THE RECIPIENT'S VIEW
// //
// // FLOW (state machine):
// //   loading  → skeleton card that mirrors the real layout
// //   network  → ConnectionLostCard("You're offline") + Try again
// //   server   → ConnectionLostCard("We'll be right back") + Try again
// //   expired  → LinkExpiredCard (permanent — file is gone)
// //   complete → DownloadCompleteCard (green strip + ⭐ feedback)
// //   else     → main card: banner → illustration → file facts →
// //               unlock (if encrypted) → Download + live progress
// //
// // Expiry is enforced by the BACKEND (404/410). We only display it.
// // ============================================================
// import { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import toast from "react-hot-toast";
// import {
//   Box, Button, Card, Container, Group, Paper, PasswordInput, Progress,
//   SimpleGrid, Skeleton, Stack, Text, Title,
// } from "@mantine/core";
// import { Download as DownloadIcon, Lock, ShieldCheck } from "lucide-react";
// import { Illustration } from "../components/Illustration";
// import { InfoBanner } from "../components/InfoBanner";
// import { LinkExpiredCard } from "../components/download/LinkExpiredCard";
// import { ConnectionLostCard } from "../components/download/ConnectionLostCard";
// import { DownloadCompleteCard } from "../components/download/DownloadCompleteCard";
// import { fetchFileMetadata, requestDownloadUrl } from "../lib/api";
// import { downloadBlobWithProgress, triggerDownloadFromBlob, triggerDownloadFromArrayBuffer } from "../lib/download";
// import { decryptFile } from "../lib/crypto";

// // Shape of the metadata the backend returns for a valid token
// interface FileMetadata {
//   originalName: string; mimeType: string; sizeBytes: number;
//   isEncrypted: boolean; expiresAt: string; downloadCount: number;
// }

// // The 3 failure families → which card we show
// type ErrorKind = "network" | "server" | "expired";

// function classifyError(err: unknown): ErrorKind {
//   const e = err as { response?: { status?: number }; code?: string; message?: string };
//   const status = e?.response?.status;
//   if (status === 404 || status === 410) return "expired";       // gone forever
//   if (status && status >= 500) return "server";                 // our fault, retry-able
//   const msg = `${e?.message ?? ""} ${e?.code ?? ""}`;
//   if (/404|410|expired|not found|no such/i.test(msg)) return "expired";
//   if (!status && /network|fetch|offline|connection|econn|enotfound|timeout/i.test(msg)) return "network";
//   if (!status && typeof navigator !== "undefined" && !navigator.onLine) return "network";
//   return "server";
// }

// // Human-readable size (2.2 MB, 430.25 KB…)
// function formatFileSize(bytes: number): string {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
// }

// // One label/value cell in the facts grid
// function Detail({ label, value }: { label: string; value: string }) {
//   return (
//     <div>
//       <Text fz={10} c="dimmed" tt="uppercase" fw={600}>{label}</Text>
//       <Text fz="sm" fw={500} mt={2}>{value}</Text>
//     </div>
//   );
// }

// export function DownloadPage() {
//   const { token } = useParams<{ token: string }>(); // /file/abc123 → "abc123"

//   const [file, setFile] = useState<FileMetadata | null>(null);
//   const [loading, setLoading] = useState<boolean>(() => !!token);
//   const [errorKind, setErrorKind] = useState<ErrorKind | null>(token ? null : "expired");
//   const [attempt, setAttempt] = useState(0);        // bump to retry
//   const [password, setPassword] = useState("");
//   const [unlocked, setUnlocked] = useState(false);
//   const [downloading, setDownloading] = useState(false);
//   const [complete, setComplete] = useState(false);
//   const [dlProgress, setDlProgress] = useState<number | null>(null);
//   const [dlSlow, setDlSlow] = useState(false);
//   const dlStartRef = useRef(0);

//   // Fetch metadata on open; classify failures into the right card
//   useEffect(() => {
//     if (!token) return;
//     let cancelled = false;
//     fetchFileMetadata(token)
//       .then((data) => { if (!cancelled) { setFile(data); setErrorKind(null); setLoading(false); } })
//       .catch((err) => { if (!cancelled) { setErrorKind(classifyError(err)); setLoading(false); } });
//     return () => { cancelled = true; };
//   }, [token, attempt]);

//   const retry = () => { setLoading(true); setErrorKind(null); setAttempt((a) => a + 1); };

//   // Download button: presigned URL → blob (with progress) → decrypt if needed → save
//   const handleDownload = async () => {
//     if (!token || !file) return;
//     if (!navigator.onLine) { toast.error("You're offline — check your internet and try again."); return; }

//     setDownloading(true); setDlProgress(0); setDlSlow(false);
//     dlStartRef.current = Date.now();
//     const onProg = (p: number | null) => {
//       if (p !== null) {
//         setDlProgress(p);
//         if (Date.now() - dlStartRef.current > 5000 && p < 90) setDlSlow(true);
//       }
//     };

//     try {
//       const d = await requestDownloadUrl(token, file.isEncrypted ? password : undefined);
//       const blob = await downloadBlobWithProgress(d.downloadUrl, onProg);

//       if (!d.isEncrypted) {
//         triggerDownloadFromBlob(blob, d.originalName);
//         toast.success("Download started!");
//       } else {
//         if (!d.salt || !d.iv) throw new Error("Missing encryption parameters");
//         const data = await blob.arrayBuffer();
//         const decrypted = await decryptFile(data, password, d.salt, d.iv);
//         triggerDownloadFromArrayBuffer(decrypted, d.originalName, d.mimeType);
//         toast.success("File decrypted!");
//       }
//       setComplete(true);
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : "Download failed");
//       setUnlocked(false);
//     } finally {
//       setDownloading(false);
//       setDlProgress(null);
//     }
//   };

//   return (
//     <Container size="xs" py={{ base: "md", sm: "xl" }}>
//       {/* ---------- LOADING: skeleton that mirrors the real card ---------- */}
//       {loading && (
//         <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
//           <Stack gap="md">
//             <Group gap="sm" wrap="nowrap">
//               <Skeleton height={40} width={40} radius="md" />
//               <Stack gap={8} style={{ flex: 1 }}>
//                 <Skeleton height={12} width="55%" />
//                 <Skeleton height={10} width="35%" />
//               </Stack>
//             </Group>
//             <SimpleGrid cols={2} spacing="sm">
//               <Skeleton height={38} /><Skeleton height={38} />
//               <Skeleton height={38} /><Skeleton height={38} />
//             </SimpleGrid>
//             <Skeleton height={44} radius="md" />
//           </Stack>
//         </Card>
//       )}

//       {/* ---------- FAILURE CARDS ---------- */}
//       {!loading && errorKind === "network" && <ConnectionLostCard variant="network" onRetry={retry} />}
//       {!loading && errorKind === "server" && <ConnectionLostCard variant="server" onRetry={retry} />}
//       {!loading && errorKind === "expired" && <LinkExpiredCard />}

//       {/* ---------- SUCCESS ---------- */}
//       {!loading && !errorKind && complete && (
//         <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
//           <DownloadCompleteCard />
//         </Card>
//       )}

//       {/* ---------- MAIN DOWNLOAD UI ---------- */}
//       {!loading && !errorKind && file && !complete && (
//         <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
//           {/* Brand banner: the only orange on this page (it's an action page) */}
//           <Box bg="var(--mantine-color-brand-filled)" p="md">
//             <Group>
//               <DownloadIcon color="white" size={20} />
//               <div>
//                 <Title order={3} c="white">Download files</Title>
//                 <Text fz="xs" c="white">Shared securely with VaultHub</Text>
//               </div>
//             </Group>
//           </Box>

//           <Stack gap="md" p={{ base: "md", sm: "xl" }}>
//             <Illustration src="/illustrations/download.svg" alt="Downloading a file" maxWidth={200} />

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

//             <SimpleGrid cols={2}>
//               <Detail label="Size" value={formatFileSize(file.sizeBytes)} />
//               <Detail label="Expires" value={file.expiresAt?.split("T")[0] ?? ""} />
//               <Detail label="Encrypted" value={file.isEncrypted ? "Yes" : "No"} />
//               <Detail label="Downloads" value={String(file.downloadCount ?? 0)} />
//             </SimpleGrid>

//             {/* Encrypted → unlock first */}
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

//             {/* Unlocked / plain → download with live progress */}
//             {(!file.isEncrypted || unlocked) && (
//               <Stack gap="xs">
//                 <Button fullWidth size="md" loading={downloading} onClick={handleDownload}
//                   leftSection={<DownloadIcon size={16} />}>
//                   {downloading && dlProgress !== null ? `Downloading… ${dlProgress}%` : "Download"}
//                 </Button>

//                 {downloading && dlProgress !== null && (
//                   <>
//                     <Progress value={dlProgress} size={6} radius="xl"
//                       color="var(--mantine-color-blue-6)" mt={4} />
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
// DownloadPage - THE RECIPIENT'S VIEW
//
// SECURITY: password is verified ONLY by the backend when the
// single button is pressed. Wrong password = inline error and
// the card stays locked. Nothing is consumed on a wrong try.
//
// ONE-BUTTON FLOW:
//   encrypted file  -> button says "Unlock and download"
//   plain file      -> button says "Download"
//   pressed         -> backend verifies, then the file downloads
//
// LAYOUT: left = file info, right = action card + good-to-know card
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Box, Button, Card, Container, Group, Paper, PasswordInput, Progress,
  SimpleGrid, Skeleton, Stack, Text, Title,
} from "@mantine/core";
import { Clock, Download as DownloadIcon, File as FileIcon, Lock, ShieldCheck } from "lucide-react";
import { Illustration } from "../components/Illustration";
import { LinkExpiredCard } from "../components/download/LinkExpiredCard";
import { ConnectionLostCard } from "../components/download/ConnectionLostCard";
import { DownloadCompleteCard } from "../components/download/DownloadCompleteCard";
import { fetchFileMetadata, requestDownloadUrl } from "../lib/api";
import { downloadBlobWithProgress, triggerDownloadFromBlob, triggerDownloadFromArrayBuffer } from "../lib/download";
import { decryptFile } from "../lib/crypto";

interface FileMetadata {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isEncrypted: boolean;
  expiresAt: string;
  downloadCount: number;
}

type ErrorKind = "network" | "server" | "expired";

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

  // Read #password fragment once, during first render
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
  const dlStartRef = useRef(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchFileMetadata(token)
      .then((data) => {
        if (!cancelled) { setFile(data); setErrorKind(null); setLoading(false); }
      })
      .catch((err) => {
        if (!cancelled) { setErrorKind(classifyError(err)); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [token, attempt]);

  // Strip #fragment from the address bar (side effect only)
  useEffect(() => {
    if (window.location.hash && window.location.hash.length > 1) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  const retry = () => { setLoading(true); setErrorKind(null); setAttempt((a) => a + 1); };

  // ONE button: backend verifies the password, then the file downloads
  const handleDownload = async () => {
    if (!token || !file) return;
    if (file.isEncrypted && !password) {
      setUnlockError("Enter the password first.");
      return;
    }
    if (!navigator.onLine) { toast.error("You're offline. Check your internet and try again."); return; }

    setDownloading(true); setDlProgress(0); setDlSlow(false); setUnlockError(null);
    dlStartRef.current = Date.now();
    const onProg = (p: number | null) => {
      if (p !== null) {
        setDlProgress(p);
        if (Date.now() - dlStartRef.current > 5000 && p < 90) setDlSlow(true);
      }
    };

    try {
      // Backend checks the password here. Wrong = 403, nothing consumed.
      const d = await requestDownloadUrl(token, file.isEncrypted ? password : undefined);
      const blob = await downloadBlobWithProgress(d.downloadUrl, onProg);

      if (!d.isEncrypted) {
        triggerDownloadFromBlob(blob, d.originalName);
        toast.success("Download started");
      } else {
        if (!d.salt || !d.iv) throw new Error("Missing encryption parameters");
        const data = await blob.arrayBuffer();
        const decrypted = await decryptFile(data, password, d.salt, d.iv);
        triggerDownloadFromArrayBuffer(decrypted, d.originalName, d.mimeType);
        toast.success("File decrypted");
      }
      setComplete(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Download failed";
      if (/incorrect password|wrong password|403/i.test(msg)) {
        // Stay locked, show inline error, keep the password for editing
        setUnlockError("Wrong password. Check it with the sender and try again.");
      } else {
        toast.error(msg);
      }
    } finally {
      setDownloading(false);
      setDlProgress(null);
    }
  };

  return (
    <Container size="md" py={{ base: "md", sm: "xl" }}>
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
          {/* Clean white header, no orange line */}
          <Group p="md" gap="sm">
            <Paper w={40} h={40} radius="md" bg="var(--mantine-color-brand-light)" c="brand"
              style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
              <DownloadIcon size={20} />
            </Paper>
            <div>
              <Title order={3}>Download files</Title>
              <Text fz="xs" c="dimmed">Shared securely with VaultHub</Text>
            </div>
          </Group>

          <Box p={{ base: "md", sm: "xl" }} style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              {/* LEFT: the file */}
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

              {/* RIGHT: one action card + good-to-know card (no dead space) */}
              <Stack gap="md">
                <Paper withBorder radius="md" p="md">
                  {file.isEncrypted ? (
                    <Stack gap="sm">
                      <Group gap={6}>
                        <Lock size={14} style={{ color: "var(--mantine-color-brand-6)" }} />
                        <Text fz="sm" fw={700}>This file is locked</Text>
                      </Group>
                      <Text fz="xs" c="dimmed">
                        Enter the password the sender shared with you, then press the button.
                        We never store it and can't recover it.
                      </Text>
                      {autoFilled && !unlockError && (
                        <Text fz="xs" c="green">Password auto-filled from your link.</Text>
                      )}
                      <PasswordInput
                        label="Password"
                        placeholder="Enter password to unlock"
                        value={password}
                        error={unlockError ?? undefined}
                        onChange={(e) => { setPassword(e.currentTarget.value); setUnlockError(null); }}
                      />
                      <Button fullWidth size="md" loading={downloading} onClick={handleDownload}
                        leftSection={<Lock size={16} />}>
                        {downloading && dlProgress !== null ? `Downloading... ${dlProgress}%` : "Unlock and download"}
                      </Button>
                    </Stack>
                  ) : (
                    <Stack gap="xs">
                      <Button fullWidth size="md" loading={downloading} onClick={handleDownload}
                        leftSection={<DownloadIcon size={16} />}>
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
                    <Group gap={8} wrap="nowrap" align="flex-start">
                      <Lock size={14} style={{ color: "var(--mantine-color-brand-6)", flexShrink: 0, marginTop: 2 }} />
                      <Text fz="xs" c="dimmed">The password never reaches us. Unlocking happens on your device.</Text>
                    </Group>
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
    </Container>
  );
}

export default DownloadPage;