// import { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { fetchFileMetadata, requestDownloadUrl } from "../lib/api";
// import { triggerDownload, triggerDownloadFromArrayBuffer } from "../lib/download";
// import { decryptFile } from "../lib/crypto";
// import toast, { Toaster } from "react-hot-toast"; 

// interface FileMetadata {
//   originalName: string;
//   mimeType: string;
//   sizeBytes: number;
//   isEncrypted: boolean;
//   expiresAt: string;
//   downloadCount: number;
// }

// function formatFileSize(bytes: number): string {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const sizes = ["Bytes", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
// }

// export function DownloadPage() {
//   const { token } = useParams<{ token: string }>();

//   // ===== ALL STATES INSIDE THE COMPONENT =====
//   const [file, setFile] = useState<FileMetadata | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [password, setPassword] = useState("");
//   const [downloading, setDownloading] = useState(false);
//   const [downloadError, setDownloadError] = useState<string | null>(null);

//   // ===== LOAD FILE METADATA WHEN PAGE OPENS =====
//   useEffect(() => {
//     async function loadFile() {
//       if (!token) {
//         setError("No file token provided");
//         setLoading(false);
//         return;
//       }
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await fetchFileMetadata(token);
//         setFile(response);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to load file");
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadFile();
//   }, [token]);

//   // ===== HANDLE DOWNLOAD BUTTON CLICK =====
//   const handleDownload = async () => {
//     // console.log("Step 1: Button clicked, requesting download URL...");
//     // console.log("token:", token);
//     // console.log("file:", file);
    
//     if (!token || !file) {
//       // console.log("step 2 : missing token or file, stopping");
//       return;
//     }
//     // console.log("Step 2: token and file exist");
//     setDownloading(true);
//     setDownloadError(null);

//     try {
//       // console.log("step 3: calling requestDownloadUrl...");
//       // const result = await requestDownloadUrl(
//       //   token,
//       //   file.isEncrypted ? password : undefined
//       // );
//       // console.log("step 4: got result:", result);

//       // 1. Store the internal data wrapper into an object
//       const downloadData = await requestDownloadUrl(
//         token,
//         file.isEncrypted ? password:undefined
//       );
// // console.log("step 4: got downloadData:", downloadData);

//       if (!downloadData.isEncrypted) {
//         // console.log("step 5: file not encrypted, triggering download");
//         // console.log("URL:", downloadData.downloadUrl);
//         // console.log("Filename:", downloadData.originalName);
        
//         // 2. Pass the nested data parameters to your trigger function
//         triggerDownload(downloadData.downloadUrl, downloadData.originalName);
//          toast.success("Download started!"); 
//         // console.log("step 6: triggeredDownload called");
//       } else {
//         // Encrypted file workflow
//         // console.log("File is encrypted, Downloading and decrypting...");
        
//         // 3. Fetch from nested object URL
//         const encryptedResponse = await fetch(downloadData.downloadUrl);
//         if (!encryptedResponse.ok) {
//           throw new Error("Failed to download encrypted file from S3");
//         }
        
//         const encryptedData = await encryptedResponse.arrayBuffer();
//         // console.log("Downloaded encrypted file from S3");

//         // 4. Verify nested encryption properties
//         if (!downloadData.salt || !downloadData.iv) {
//           throw new Error("Missing encryption parameters");
//         }

//         const decryptedData = await decryptFile(
//           encryptedData,
//           password,
//           downloadData.salt,
//           downloadData.iv
//         );
//         // console.log("Decryption was successful");

//         triggerDownloadFromArrayBuffer(
//           decryptedData,
//           downloadData.originalName,
//           downloadData.mimeType
//         );
//            toast.success("File decrypted and download started!"); 
//         // console.log("File saved to Downloads Folder");
//       }
//     } catch (err) {
//       // console.log("Error in try block:", err);
//    // Set local download error (keeps page intact)
//       const message = err instanceof Error ? err.message : "Download failed";
//       setDownloadError(message);
//       toast.error(message);
//     } finally {
//       // console.log("finally block running");
//       setDownloading(false);
//     }
//   };

//   // ========== LOADING STATE ==========
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white-100">
//         <div className="text-center">
//           <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full mx-auto mb-4 animate-spin" />
//           <p className="text-gray-500 text-sm m-0">Loading file...</p>
//         </div>
//       </div>
//     );
//   }

//   // ========== ERROR STATE ==========
//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white-100">
//         <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
//           <p className="text-red-600 text-sm">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   // ========== MAIN PAGE ==========
//   return (
//     <div className="min-h-screen bg-white-100 py-12 px-4">
//       <Toaster position="top-center" />   {/* <-- Toast container */}
//       <div className="max-w-md mx-auto bg-white rounded-xl p-8 border border-gray-200">
//         {/* File Header */}
//         <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-200">
//           <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
//             📄
//           </div>
//           <div>
//             <h1 className="text-lg font-semibold text-gray-900 mb-1">
//               {file?.originalName}
//             </h1>
//             <p className="text-sm text-gray-500 m-0">{file?.mimeType}</p>
//           </div>
//         </div>

//         {/* File Details Grid */}
//         <div className="grid grid-cols-2 gap-4 mb-6">
//           <DetailItem label="Size" value={formatFileSize(file?.sizeBytes || 0)} />
//           <DetailItem label="Expires" value={file?.expiresAt?.split("T")[0] || ""} />
//           <DetailItem label="Encrypted" value={file?.isEncrypted ? "Yes" : "No"} />
//           <DetailItem label="Downloads" value={String(file?.downloadCount || 0)} />
//         </div>

           

//         {/* Password Input */}
//         {file?.isEncrypted && (
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Password
//             </label>
//             <input
//               type="password"
//               placeholder="Enter password to decrypt"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//         )}

//         {/* Download Button */}
//         <button
//           onClick={handleDownload}
//           disabled={downloading || (file?.isEncrypted && !password)}
//           className="w-full p-3 bg-blue-600 disabled:bg-blue-300 text-white border-none rounded-lg text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70 hover:bg-blue-700 transition-colors"
//         >
//           {downloading ? "Downloading..." : "Download File"}
//         </button>

//            {/* Local download error – displayed only below the button */}
//         {downloadError && (
//           <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
//             {downloadError}
//           </div>
//         )}

//         {/* Token */}
//         <p className="mt-6 text-center text-xs text-gray-300">
//           Token: {token}
//         </p>
//       </div>
//     </div>
//   );
// }

// function DetailItem({ label, value }: { label: string; value: string }) {
//   return (
//     <div>
//       <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-1 m-0">
//         {label}
//       </p>
//       <p className="text-sm text-gray-700 font-medium m-0">{value}</p>
//     </div>
//   );
// }



// ============================================================
// DownloadPage — THE RECIPIENT'S VIEW (Firefox Send "Recipients View" flow)
//
// This page handles EVERY possible outcome when someone opens a share link:
//   1. loading        → spinner card
//   2. network error  → ConnectionLostCard ("You're offline", retry-able)
//    3. server error   → ConnectionLostCard ("We'll be right back", retry-able)
//   4. expired/404/used → LinkExpiredCard (permanent — file is gone forever)
//   5. ready          → file info + password unlock (if encrypted) + Download
//   6. complete       → green "Download Complete" confirmation
//
// NOTE FOR DEVS: expiry is enforced by the BACKEND on every request
// (it returns 404/410). This page only DISPLAYS what the backend decides.
// ============================================================

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Box, Button, Card, Container, Group, Loader, Paper, PasswordInput, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Download as DownloadIcon, Lock, ShieldCheck } from "lucide-react";
import { Illustration } from "../components/Illustration";
import { InfoBanner } from "../components/InfoBanner";
import { LinkExpiredCard } from "../components/download/LinkExpiredCard";
import { ConnectionLostCard } from "../components/download/ConnectionLostCard";
import { fetchFileMetadata, requestDownloadUrl } from "../lib/api";
import { triggerDownloadv2, triggerDownloadFromArrayBuffer } from "../lib/download";
import { decryptFile } from "../lib/crypto";

// Shape of the metadata the backend sends back for a valid token
interface FileMetadata {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isEncrypted: boolean;
  expiresAt: string;
  downloadCount: number;
}

// The 3 failure families we care about
type ErrorKind = "network" | "server" | "expired";

// Figures out WHAT failed so we can show the RIGHT card:
//  - 404/410 from backend  → link expired / used up / never existed (permanent)
//  - 5xx from backend      → our server problem (retry-able)
//  - fetch throws / offline→ user's internet problem (retry-able)
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

// Human-readable file size (430.25 KB, 2.2 MB, ...)
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Tiny label/value pair used in the SIZE / EXPIRES / ENCRYPTED / DOWNLOADS grid
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

  const [file, setFile] = useState<FileMetadata | null>(null);

  // Loading starts TRUE only when we actually have a token to fetch.
  const [loading, setLoading] = useState<boolean>(() => !!token);

  // No token at all → the link can't exist → show the expired card immediately.
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(token ? null : "expired");

  // Bump this number to retry the fetch without remounting the page.
  const [attempt, setAttempt] = useState(0);

  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [complete, setComplete] = useState(false);

  // STEP 1: ask the backend for this file's metadata.
  // IMPORTANT (lint fix): every setState lives inside .then/.catch callbacks
  // (async), NEVER synchronously in the effect body — this is what keeps the
  // react-hooks "set-state-in-effect" rule happy.
  useEffect(() => {
    if (!token) return; // nothing to fetch — UI already shows the expired card
    let cancelled = false; // ignore late results if the user leaves mid-fetch

    fetchFileMetadata(token)
      .then((data) => {
        if (cancelled) return;
        setFile(data);        // valid link → show the download UI
        setErrorKind(null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorKind(classifyError(err)); // decide WHICH error card to show
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token, attempt]);

  // "Try again" button on the Connection Lost card.
  // setState here is fine — event handlers are allowed to set state.
  const retry = () => {
    setLoading(true);
    setErrorKind(null);
    setAttempt((a) => a + 1); // effect re-runs because `attempt` changed
  };

  // STEP 2: user pressed Download → backend verifies password/limits,
  // then hands us a short-lived presigned S3 URL.
  const handleDownload = async () => {
    if (!token || !file) return;

    // Fail fast if the device is already offline (no fake "success" ever).
    if (!navigator.onLine) {
      toast.error("You're offline — check your internet and try again.");
      return;
    }

    setDownloading(true);
    try {
      const d = await requestDownloadUrl(token, file.isEncrypted ? password : undefined);

      if (!d.isEncrypted) {
        // Plain file → download straight from S3 (blob validated inside triggerDownloadv2)
        triggerDownloadv2(d.downloadUrl, d.originalName);
        toast.success("Download started!");
      } else {
        // Encrypted file → fetch the locked bytes, unlock them LOCALLY in the browser
        const res = await fetch(d.downloadUrl);
        if (!res.ok) throw new Error("Failed to fetch encrypted file");
        const data = await res.arrayBuffer();
        if (!d.salt || !d.iv) throw new Error("Missing encryption parameters");
        const decrypted = await decryptFile(data, password, d.salt, d.iv);
        triggerDownloadFromArrayBuffer(decrypted, d.originalName, d.mimeType);
        toast.success("File decrypted!");
      }
      setComplete(true); // only reached when everything really succeeded
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
      setUnlocked(false); // let them re-enter the password and retry
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Container size="xs" py="xl">
      {/* ---------- LOADING ---------- */}
      {loading && (
        <Card withBorder shadow="sm" radius="lg" p="xl">
          <Stack align="center" gap="md">
            <Loader color="var(--mantine-color-blue-6)" />
            <Text fz="sm" c="dimmed">Loading file...</Text>
          </Stack>
        </Card>
      )}

      {/* ---------- INTERNET / SERVER PROBLEM (retry-able) ---------- */}
      {!loading && errorKind === "network" && (
        <ConnectionLostCard variant="network" onRetry={retry} />
      )}
      {!loading && errorKind === "server" && (
        <ConnectionLostCard variant="server" onRetry={retry} />
      )}

      {/* ---------- EXPIRED / USED UP / NEVER EXISTED (permanent) ---------- */}
      {!loading && errorKind === "expired" && <LinkExpiredCard />}

      {/* ---------- DOWNLOAD COMPLETE ---------- */}
      {!loading && !errorKind && complete && (
        <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
          {/* Slim green success strip (not a giant banner) */}
          <Group gap={8} px="lg" py={10} bg="var(--mantine-color-green-light)">
            <Text fz="sm" fw={700} c="var(--mantine-color-green-7)">✓ Download Complete</Text>
            <Text fz="xs" c="dimmed" ml="auto">saved to your device</Text>
          </Group>
          <Stack p="xl" gap="md" align="center">
            <Illustration src="/illustrations/successful-upload.svg" alt="Download complete" maxWidth={150} />
            <Text fz="sm" c="dimmed" ta="center">
              You can now close this window. The link keeps working until it expires
              or reaches its download limit.
            </Text>
            {/* Friendly nudge: turn this happy downloader into a sender */}
            <Stack gap={10} align="center" mt={4}>
              <Text fz="sm" c="dimmed" ta="center" maw={420}>
                That was easy, right? Next time you need to send something —
                big or small — VaultHub is free, private and needs no account.
              </Text>
              <Button component={Link} to="/" leftSection={<DownloadIcon size={16} />}>
                Send a file — it's free
              </Button>
            </Stack>
          </Stack>
        </Card>
      )}

      {/* ---------- MAIN DOWNLOAD UI ---------- */}
      {!loading && !errorKind && file && !complete && (
        <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
          {/* Slim blue brand banner */}
          <Box bg="var(--mantine-color-blue-filled)" p="md">
            <Group>
              <DownloadIcon color="white" size={20} />
              <div>
                <Title order={3} c="white">Download files</Title>
                <Text fz="xs" c="white">Shared securely with VaultHub</Text>
              </div>
            </Group>
          </Box>

          <Stack gap="md" p="xl">
            {/* File identity row */}
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

            {/* The facts grid */}
            <SimpleGrid cols={2}>
              <Detail label="Size" value={formatFileSize(file.sizeBytes)} />
              <Detail label="Expires" value={file.expiresAt?.split("T")[0] ?? ""} />
              <Detail label="Encrypted" value={file.isEncrypted ? "Yes" : "No"} />
              <Detail label="Downloads" value={String(file.downloadCount ?? 0)} />
            </SimpleGrid>

            {/* Encrypted? Ask for the password first (eye icon built into PasswordInput) */}
            {file.isEncrypted && !unlocked && (
              <Stack gap="sm">
                <InfoBanner>
                  This file is encrypted. Enter the password sent to you by the sender —
                  VaultHub never stores it and cannot recover it.
                </InfoBanner>
                <Text fz="sm" fw={500}>
                  <Lock size={14} style={{ verticalAlign: -2 }} /> This file is password protected
                </Text>
                <PasswordInput
                  label="Password"
                  placeholder="Enter password to decrypt"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />
                <Button fullWidth disabled={!password} onClick={() => setUnlocked(true)}>Unlock</Button>
              </Stack>
            )}

            {/* Unlocked (or not encrypted) → the real Download button */}
            {(!file.isEncrypted || unlocked) && (
              <Stack gap="xs">
                <Button fullWidth size="md" loading={downloading} onClick={handleDownload}
                  leftSection={<DownloadIcon size={16} />}>
                  Download
                </Button>
                {file.isEncrypted && (
                  <Button variant="subtle" size="xs" color="gray"
                    onClick={() => { setUnlocked(false); setPassword(""); }}>
                    Wrong password? Try again
                  </Button>
                )}
              </Stack>
            )}
          </Stack>

          {/* Factual footer strip */}
          <Box p="md" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
            <Text fz="xs" c="dimmed">
              <ShieldCheck size={14} style={{ verticalAlign: -2 }} /> End-to-end encrypted • automatically deleted after 1 day or 10 downloads
            </Text>
          </Box>
        </Card>
      )}
    </Container>
  );
}

export default DownloadPage;