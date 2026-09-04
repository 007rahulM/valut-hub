// // ============================================================
// // UPLOAD ENGINE — Module-level singleton that survives page navigation
// // WHY: React components unmount when you navigate away, killing uploads.
// // This engine lives outside React, so uploads continue in the background.
// // ============================================================

// import {
//   requestUploadUrl,
//   uploadFileToS3WithProgress,
//   startMultipartUpload,
//   getPartUploadUrl,
//   completeMultipartUpload,
//   uploadChunkWithProgress,
//   abortMultipartUpload,
//   ApiError,
// } from "./api";

// import {
//   encryptFile,
//   deriveEncryptionKey,
//   generateSaltAndBaseIv,
//   encryptChunk,
//   uint8ArrayToBase64,
//   base64ToUint8Array,
//   getChunkSize,
// } from "./crypto";

// import { loadCheckpoint, saveCheckpoint, clearCheckpoint } from "./resumeStore";

// // ============================================================
// // TYPE DEFINITIONS
// // ============================================================

// export type EngineStatus =
//   | "idle"
//   | "encrypting"
//   | "uploading"
//   | "stitching"
//   | "done"
//   | "error"
//   | "paused";

// export interface EngineState {
//   status: EngineStatus;
//   progress: number;
//   chatter: string;
//   failed: string | null;
//   shareUrl: string | null;
//   fileName: string | null;
//   fileSize: number | null;
//   isEncrypted: boolean;
//   password: string;
//   createdAt: number | null;
//   isPaused: boolean;
// }

// // ============================================================
// // ENGINE STATE MANAGEMENT
// // ============================================================

// let state: EngineState = {
//   status: "idle",
//   progress: 0,
//   chatter: "",
//   failed: null,
//   shareUrl: null,
//   fileName: null,
//   fileSize: null,
//   isEncrypted: false,
//   password: "",
//   createdAt: null,
//   isPaused: false,
// };

// const listeners = new Set<() => void>();

// function setState(patch: Partial<EngineState>) {
//   state = { ...state, ...patch };
//   listeners.forEach((l) => l());
// }

// export const getEngineState = () => state;

// export function subscribeEngine(fn: () => void) {
//   listeners.add(fn);
//   return () => {
//     listeners.delete(fn);
//   };
// }

// export function resetEngine() {
//   stopChatter();
//   removeVisibilityListener();
//   setState({
//     status: "idle",
//     progress: 0,
//     chatter: "",
//     failed: null,
//     shareUrl: null,
//     fileName: null,
//     fileSize: null,
//     isEncrypted: false,
//     password: "",
//     createdAt: null,
//     isPaused: false,
//   });
// }

// // ============================================================
// // HUMAN CHATTER SYSTEM
// // ============================================================

// let chatterTimer: number | null = null;

// const UPLOAD_CHATTER = [
//   "Locking your file with military-grade encryption…",
//   "Chunks are flying to the cloud, 3 lanes wide…",
//   "Still working, big files take a little while. You can browse other pages.",
//   "Pushing steadily. Your internet is doing its best.",
//   "Receipts are piling up nicely. Stitching happens at the end.",
//   "Hang tight, I'll call out when it's done.",
// ];

// function startChatter() {
//   stopChatter();
//   let i = 0;
//   chatterTimer = window.setInterval(() => {
//     if (state.status === "uploading" || state.status === "stitching") {
//       setState({ chatter: UPLOAD_CHATTER[i % UPLOAD_CHATTER.length] });
//       i++;
//     }
//   }, 8000);
// }

// function stopChatter() {
//   if (chatterTimer !== null) {
//     window.clearInterval(chatterTimer);
//     chatterTimer = null;
//   }
// }

// // ============================================================
// // TAB VISIBILITY DETECTION
// // ============================================================

// let visibilityListener: (() => void) | null = null;

// function setupVisibilityListener() {
//   if (visibilityListener) return;

//   visibilityListener = () => {
//     if (document.hidden) {
//       console.log("%c[TAB] Tab hidden — upload will continue in background", "color: orange; font-weight: bold;");
//       setState({ isPaused: true, chatter: "Tab hidden — continuing in background…" });
//     } else {
//       console.log("%c[TAB] Tab visible again — resuming normal operation", "color: green; font-weight: bold;");
//       setState({ isPaused: false, chatter: "Tab visible — back to normal" });
//     }
//   };

//   document.addEventListener("visibilitychange", visibilityListener);
//   console.log("%c[TAB] Visibility listener attached", "color: blue;");
// }

// function removeVisibilityListener() {
//   if (visibilityListener) {
//     document.removeEventListener("visibilitychange", visibilityListener);
//     visibilityListener = null;
//     console.log("%c[TAB] Visibility listener removed", "color: blue;");
//   }
// }

// // ============================================================
// // RESILIENCE HELPERS
// // ============================================================

// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// function waitForOnline(): Promise<void> {
//   return new Promise((resolve) => {
//     const t = window.setTimeout(() => {
//       window.removeEventListener("online", h);
//       resolve();
//     }, 5 * 60 * 1000);

//     const h = () => {
//       window.clearTimeout(t);
//       window.removeEventListener("online", h);
//       resolve();
//     };

//     window.addEventListener("online", h);
//   });
// }

// async function retry<T>(fn: () => Promise<T>, tries: number): Promise<T> {
//   let lastErr: unknown;
//   for (let i = 0; i < tries; i++) {
//     try {
//       return await fn();
//     } catch (e) {
//       lastErr = e;
//       if (!navigator.onLine) {
//         setState({ chatter: "Internet dropped. Waiting for it to come back…" });
//         await waitForOnline();
//       } else {
//         await sleep(1500 * (i + 1));
//       }
//     }
//   }
//   throw lastErr;
// }

// const isNetworkErr = (e: unknown) =>
//   !navigator.onLine ||
//   e instanceof TypeError ||
//   (e instanceof ApiError &&
//     ["NETWORK_ERROR", "S3_CHUNK_FAILED", "PART_URL_FAILED", "MULTIPART_START_FAILED"].includes(e.code));

// async function hashPassword(password: string): Promise<string> {
//   const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
//   return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
// }

// // ============================================================
// // PUBLIC START FUNCTION
// // ============================================================

// export interface UploadConfig {
//   file: File;
//   password: string;
//   isEncrypted: boolean;
//   maxDownloads: number;
// }

// export async function startUpload(cfg: UploadConfig): Promise<void> {
//   if (state.status === "encrypting" || state.status === "uploading" || state.status === "stitching") {
//     console.warn("%c[ENGINE] Upload already in progress — ignoring duplicate start", "color: red;");
//     return;
//   }

//   console.log("%c[ENGINE] ═══════════════════════════════════════", "color: blue; font-weight: bold;");
//   console.log("%c[ENGINE] UPLOAD STARTED", "color: blue; font-weight: bold;");
//   console.log(`%c[ENGINE] File: ${cfg.file.name}`, "color: blue;");
//   console.log(`%c[ENGINE] Size: ${(cfg.file.size / 1024 / 1024).toFixed(2)} MB`, "color: blue;");
//   console.log(`%c[ENGINE] Encrypted: ${cfg.isEncrypted}`, "color: blue;");
//   console.log("%c[ENGINE] ═══════════════════════════════════════", "color: blue; font-weight: bold;");

//   setState({
//     status: "encrypting",
//     progress: 0,
//     failed: null,
//     shareUrl: null,
//     fileName: cfg.file.name,
//     fileSize: cfg.file.size,
//     isEncrypted: cfg.isEncrypted,
//     password: cfg.password,
//     chatter: "Locking your file on this device…",
//     createdAt: null,
//     isPaused: false,
//   });

//   setupVisibilityListener();
//   startChatter();

//   const t0 = performance.now();

//   try {
//     const chunkSize = getChunkSize(cfg.file.size);
//     const isMultipart = chunkSize > 0;

//     console.log(`%c[ENGINE] Chunk size: ${isMultipart ? (chunkSize / 1024 / 1024).toFixed(1) + " MB" : "Single PUT"}`, "color: blue;");
//     console.log(`%c[ENGINE] Mode: ${isMultipart ? "MULTIPART" : "SINGLE"}`, "color: blue; font-weight: bold;");

//     const shareUrl = isMultipart
//       ? await runMultipartWithAutoResume(cfg, chunkSize)
//       : await runSingle(cfg);

//     setState({
//       status: "done",
//       progress: 100,
//       shareUrl,
//       chatter: "Done! Your link is ready.",
//       createdAt: Date.now(),
//     });

//     const totalTime = ((performance.now() - t0) / 1000).toFixed(1);
//     console.log(`%c[ENGINE] ═══════════════════════════════════════`, "color: green; font-weight: bold;");
//     console.log(`%c[ENGINE] ✅ UPLOAD COMPLETE in ${totalTime}s`, "color: green; font-weight: bold;");
//     console.log(`%c[ENGINE] Share URL: ${shareUrl}`, "color: green;");
//     console.log(`%c[ENGINE] ═══════════════════════════════════════`, "color: green; font-weight: bold;");
//   } catch (err) {
//     console.error("%c[ENGINE] ═══════════════════════════════════════", "color: red; font-weight: bold;");
//     console.error("%c[ENGINE] ❌ UPLOAD FAILED", "color: red; font-weight: bold;");
//     console.error("%c[ENGINE] Error:", err);
//     console.error("%c[ENGINE] ═══════════════════════════════════════", "color: red; font-weight: bold;");

//     // 🚨 FIX: Deliberate, friendly error messages for specific backend rejections
//     let friendlyMsg = !navigator.onLine
//       ? "Your internet dropped and didn't come back in time."
//       : err instanceof Error
//       ? err.message
//       : "Upload failed.";

//     if (err instanceof ApiError) {
//       if (err.code === "DAILY_FILE_LIMIT_EXCEEDED" || err.code === "UPLOAD_QUOTA_EXCEEDED") {
//         friendlyMsg = "Daily upload limit reached. Please try again tomorrow!";
//       } else if (err.code === "FILE_TOO_LARGE") {
//         friendlyMsg = "File is too large. Maximum allowed size is 500MB.";
//       } else if (err.code === "BLOCKED_FILE_TYPE" || err.code === "UNSUPPORTED_FILE_TYPE") {
//         friendlyMsg = "This file type is not allowed for security reasons. Try zipping it first.";
//       }
//     }

//     setState({
//       status: "error",
//       failed: friendlyMsg,
//     });
//   } finally {
//     stopChatter();
//   }
// }

// // ============================================================
// // PATH A: SINGLE PUT (files < 16MB)
// // ============================================================

// async function runSingle(cfg: UploadConfig): Promise<string> {
//   console.log("%c[SINGLE] Starting single PUT upload", "color: purple; font-weight: bold;");

//   let fileToUpload: File | Blob = cfg.file;
//   let salt: string | null = null;
//   let iv: string | null = null;

//   if (cfg.isEncrypted) {
//     const encStart = performance.now();
//     console.log("%c[SINGLE] Encrypting file…", "color: purple;");
//     const enc = await encryptFile(cfg.file, cfg.password);
//     fileToUpload = enc.encryptedFile;
//     salt = enc.salt;
//     iv = enc.iv;
//     const encTime = ((performance.now() - encStart) / 1000).toFixed(2);
//     console.log(`%c[SINGLE] ✅ Encryption complete in ${encTime}s`, "color: purple;");
//   }

//   setState({ status: "uploading" });

//   const passwordHash = cfg.isEncrypted ? await hashPassword(cfg.password) : null;

//   console.log("%c[SINGLE] Requesting presigned URL from backend…", "color: purple;");
//   const res = await retry(() => requestUploadUrl({
//     originalName: cfg.file.name,
//     mimeType: cfg.isEncrypted ? "application/octet-stream" : cfg.file.type,
//     sizeBytes: (fileToUpload as File).size,
//     isEncrypted: cfg.isEncrypted,
//     passwordHash,
//     iv,
//     salt,
//     expirySeconds: 24 * 60 * 60,
//     maxDownloads: cfg.maxDownloads,
//   }), 3);

//   console.log("%c[SINGLE] ✅ Presigned URL received", "color: purple;");
//   console.log("%c[SINGLE] Uploading to S3…", "color: purple;");

//   const uploadStart = performance.now();

//   await retry(() => uploadFileToS3WithProgress(res.data.presignedUrl, fileToUpload as File, {
//     onProgress: (p) => {
//       setState({ progress: p });
//       if (p % 25 === 0 && p > 0) {
//         console.log(`%c[SINGLE] Progress: ${p}%`, "color: purple;");
//       }
//     },
//   }), 2);

//   const uploadTime = ((performance.now() - uploadStart) / 1000).toFixed(2);
//   console.log(`%c[SINGLE] ✅ Upload complete in ${uploadTime}s`, "color: purple;");

//   return res.data.shareUrl;
// }

// // ============================================================
// // PATH B: MULTIPART WITH AUTO-RESUME
// // ============================================================

// async function runMultipartWithAutoResume(cfg: UploadConfig, chunkSize: number): Promise<string> {
//   for (let attempt = 0; ; attempt++) {
//     try {
//       return await runMultipartOnce(cfg, chunkSize);
//     } catch (e) {
//       if (attempt < 2 && isNetworkErr(e)) {
//         console.warn(`%c[MULTIPART] Network error on attempt ${attempt + 1} — auto-resuming`, "color: orange;");
//         setState({ chatter: "Connection dropped. Auto-resuming when internet returns…" });
//         await waitForOnline();
//         continue;
//       }
//       throw e;
//     }
//   }
// }

// async function runMultipartOnce(cfg: UploadConfig, chunkSize: number): Promise<string> {
//   const { file } = cfg;
//   const totalChunks = Math.ceil(file.size / chunkSize);
//   const totalSizeMB = (file.size / 1024 / 1024).toFixed(2);

//   console.log("%c[MULTIPART] ═══════════════════════════════════════", "color: cyan; font-weight: bold;");
//   console.log(`%c[MULTIPART] Total chunks: ${totalChunks}`, "color: cyan;");
//   console.log(`%c[MULTIPART] Chunk size: ${(chunkSize / 1024 / 1024).toFixed(1)} MB`, "color: cyan;");
//   console.log(`%c[MULTIPART] Total size: ${totalSizeMB} MB`, "color: cyan;");
//   console.log("%c[MULTIPART] ═══════════════════════════════════════", "color: cyan; font-weight: bold;");

//   const saved = await loadCheckpoint(file.name, file.size);
//   const canResume = !!saved && saved.chunkSize === chunkSize && saved.completedParts.length > 0 && saved.completedParts.length < totalChunks;

//   let token: string;
//   let uploadId: string;
//   let shareUrl: string;
//   let resumedParts: { PartNumber: number; ETag: string }[] = [];
//   let saltBase64: string | null = null;
//   let ivBase64: string | null = null;
//   let cryptoKey: CryptoKey | null = null;
//   let baseIv: Uint8Array | null = null;

//   const passwordHash = cfg.isEncrypted ? await hashPassword(cfg.password) : null;

//   if (canResume && saved) {
//     console.log(`%c[MULTIPART] 🔄 RESUME DETECTED — ${saved.completedParts.length}/${totalChunks} chunks already done`, "color: green; font-weight: bold;");

//     if (cfg.isEncrypted) {
//       console.log("%c[MULTIPART] Re-deriving encryption key from password…", "color: green;");
//       saltBase64 = saved.saltBase64;
//       ivBase64 = saved.baseIvBase64;
//       baseIv = base64ToUint8Array(saved.baseIvBase64!);
//       cryptoKey = await deriveEncryptionKey(cfg.password, base64ToUint8Array(saved.saltBase64!));
//       console.log("%c[MULTIPART] ✅ Key re-derived", "color: green;");
//     }

//     token = saved.token;
//     uploadId = saved.uploadId;
//     shareUrl = saved.shareUrl;
//     resumedParts = saved.completedParts;

//     setState({ chatter: `Resuming: ${resumedParts.length}/${totalChunks} chunks already done.` });
//   } else {
//     console.log("%c[MULTIPART] 🆕 FRESH START — no resume checkpoint found", "color: cyan;");

//     if (cfg.isEncrypted) {
//       console.log("%c[MULTIPART] Generating encryption parameters…", "color: cyan;");
//       const { salt, baseIv: gen } = generateSaltAndBaseIv();
//       baseIv = gen;
//       saltBase64 = uint8ArrayToBase64(salt);
//       ivBase64 = uint8ArrayToBase64(gen);
//       cryptoKey = await deriveEncryptionKey(cfg.password, salt);
//       console.log("%c[MULTIPART] ✅ Encryption parameters generated", "color: cyan;");
//     }

//     console.log("%c[MULTIPART] Requesting multipart session from backend…", "color: cyan;");
//     const res = await retry(() => startMultipartUpload({
//       originalName: file.name,
//       mimeType: cfg.isEncrypted ? "application/octet-stream" : file.type,
//       sizeBytes: file.size,
//       isEncrypted: cfg.isEncrypted,
//       passwordHash,
//       iv: ivBase64,
//       salt: saltBase64,
//       expirySeconds: 24 * 60 * 60,
//       maxDownloads: cfg.maxDownloads,
//     }), 3);

//     token = res.token;
//     uploadId = res.uploadId;
//     shareUrl = res.shareUrl;

//     console.log(`%c[MULTIPART] ✅ Session started — Upload ID: ${uploadId}`, "color: cyan;");

//     await saveCheckpoint({
//       token,
//       uploadId,
//       shareUrl,
//       fileName: file.name,
//       fileSize: file.size,
//       chunkSize,
//       totalChunks,
//       isEncrypted: cfg.isEncrypted,
//       saltBase64,
//       baseIvBase64: ivBase64,
//       completedParts: [],
//       savedAt: Date.now(),
//     });

//     console.log("%c[MULTIPART] ✅ Checkpoint saved to IndexedDB", "color: cyan;");
//   }

//   setState({ status: "uploading" });

//   const partResults: ({ PartNumber: number; ETag: string } | undefined)[] = new Array(totalChunks);
//   resumedParts.forEach((p) => {
//     partResults[p.PartNumber - 1] = p;
//   });

//   const done = new Set(resumedParts.map((p) => p.PartNumber - 1));
//   let uploadedBytes = 0;

//   done.forEach((i) => {
//     uploadedBytes += Math.min(chunkSize, file.size - i * chunkSize);
//   });

//   const totalBytes = file.size + (cfg.isEncrypted ? totalChunks * 16 : 0);

//   const initialProgress = Math.round((uploadedBytes / totalBytes) * 100);
//   setState({ progress: initialProgress });
//   console.log(`%c[MULTIPART] Initial progress: ${initialProgress}%`, "color: cyan;");

//   let cursor = 0;
//   const grabNext = () => {
//     while (cursor < totalChunks) {
//       const i = cursor++;
//       if (!done.has(i)) {
//         done.add(i);
//         return i;
//       }
//     }
//     return -1;
//   };

//   const uploadWorker = async (workerId: number) => {
//     while (true) {
//       const idx = grabNext();
//       if (idx === -1) break;

//       const partNumber = idx + 1;
//       const chunkStart = performance.now();

//       console.log(`%c[WORKER ${workerId}] Starting chunk ${partNumber}/${totalChunks}`, "color: magenta;");

//       const chunkBlob = file.slice(idx * chunkSize, Math.min((idx + 1) * chunkSize, file.size));
//       let chunkToUpload: Blob = chunkBlob;

//       if (cfg.isEncrypted && cryptoKey && baseIv) {
//         const encStart = performance.now();
//         const encBuf = await encryptChunk(await chunkBlob.arrayBuffer(), cryptoKey, baseIv, idx);
//         chunkToUpload = new Blob([encBuf], { type: "application/octet-stream" });
//         const encTime = ((performance.now() - encStart) / 1000).toFixed(3);
//         console.log(`%c[WORKER ${workerId}] Chunk ${partNumber} encrypted in ${encTime}s`, "color: magenta;");
//       }

//       const chunkBytes = chunkToUpload.size;
//       let lastProgressBytes = 0;

//       const presignedUrl = await retry(() => getPartUploadUrl(token, uploadId, partNumber), 3);

//       const etag = await retry(async () => {
//         return uploadChunkWithProgress(presignedUrl, chunkToUpload, {
//           onProgress: (pct) => {
//             const doneBytes = Math.round((pct / 100) * chunkBytes);
//             const delta = doneBytes - lastProgressBytes;
//             if (delta > 0) {
//               lastProgressBytes = doneBytes;
//               uploadedBytes += delta;
//               const progress = Math.min(99, Math.round((uploadedBytes / totalBytes) * 100));
//               setState({ progress });

//               if (pct % 25 === 0 && pct > 0) {
//                 console.log(`%c[WORKER ${workerId}] Chunk ${partNumber} progress: ${pct}% (overall: ${progress}%)`, "color: magenta;");
//               }
//             }
//           },
//         });
//       }, 4);

//       const chunkTime = ((performance.now() - chunkStart) / 1000).toFixed(2);
//       console.log(`%c[WORKER ${workerId}] ✅ Chunk ${partNumber} complete in ${chunkTime}s`, "color: green;");

//       partResults[idx] = { PartNumber: partNumber, ETag: etag };

//       await saveCheckpoint({
//         token,
//         uploadId,
//         shareUrl,
//         fileName: file.name,
//         fileSize: file.size,
//         chunkSize,
//         totalChunks,
//         isEncrypted: cfg.isEncrypted,
//         saltBase64,
//         baseIvBase64: ivBase64,
//         completedParts: partResults.filter(Boolean) as { PartNumber: number; ETag: string }[],
//         savedAt: Date.now(),
//       });
//     }
//   };

//   console.log("%c[MULTIPART] 🚀 Launching 3 parallel upload workers", "color: cyan; font-weight: bold;");

//   await Promise.all([uploadWorker(1), uploadWorker(2), uploadWorker(3), uploadWorker(4)]);

//   console.log("%c[MULTIPART] ✅ All chunks uploaded — stitching…", "color: cyan; font-weight: bold;");

//   setState({ status: "stitching", progress: 100, chatter: "All chunks in. Stitching the file together…" });

//   await retry(() => completeMultipartUpload(token, uploadId, partResults as { PartNumber: number; ETag: string }[]), 4);

//   console.log("%c[MULTIPART] ✅ File stitched successfully", "color: green; font-weight: bold;");

//   await clearCheckpoint(file.name, file.size);
//   console.log("%c[MULTIPART] 🗑️ Checkpoint cleared from IndexedDB", "color: green;");

//   return shareUrl;
// }

// // ============================================================
// // CANCEL UPLOAD
// // ============================================================

// export async function cancelUpload(): Promise<void> {
//   console.log("%c[ENGINE] ❌ Upload cancelled by user", "color: red; font-weight: bold;");

//   if (state.fileName && state.fileSize) {
//     const saved = await loadCheckpoint(state.fileName, state.fileSize);
//     if (saved) {
//       console.log(`%c[ENGINE] Aborting multipart session: ${saved.uploadId}`, "color: red;");
//       abortMultipartUpload(saved.token, saved.uploadId).catch(() => {});
//       await clearCheckpoint(saved.fileName, saved.fileSize);
//       console.log("%c[ENGINE] 🗑️ Checkpoint cleared", "color: red;");
//     }
//   }

//   resetEngine();
// }


// ============================================================
// UPLOAD ENGINE — Module-level singleton that survives page navigation
// WHY: React components unmount when you navigate away, killing uploads.
// This engine lives outside React, so uploads continue in the background.
// ============================================================

import {
  requestUploadUrl,
  uploadFileToS3WithProgress,
  startMultipartUpload,
  getPartUploadUrl,
  completeMultipartUpload,
  uploadChunkWithProgress,
  abortMultipartUpload,
  ApiError,
} from "./api";

import {
  encryptFile,
  deriveEncryptionKey,
  generateSaltAndBaseIv,
  encryptChunk,
  uint8ArrayToBase64,
  base64ToUint8Array,
  getChunkSize,
} from "./crypto";

import { loadCheckpoint, saveCheckpoint, clearCheckpoint } from "./resumeStore";

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type EngineStatus =
  | "idle"
  | "encrypting"
  | "uploading"
  | "stitching"
  | "done"
  | "error"
  | "paused";

export interface EngineState {
  status: EngineStatus;
  progress: number;
  chatter: string;
  failed: string | null;
  shareUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isEncrypted: boolean;
  password: string;
  createdAt: number | null;
  isPaused: boolean;
}

// ============================================================
// ENGINE STATE MANAGEMENT
// ============================================================

let state: EngineState = {
  status: "idle",
  progress: 0,
  chatter: "",
  failed: null,
  shareUrl: null,
  fileName: null,
  fileSize: null,
  isEncrypted: false,
  password: "",
  createdAt: null,
  isPaused: false,
};

const listeners = new Set<() => void>();

function setState(patch: Partial<EngineState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const getEngineState = () => state;

export function subscribeEngine(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function resetEngine() {
  stopChatter();
  removeVisibilityListener();
  setState({
    status: "idle",
    progress: 0,
    chatter: "",
    failed: null,
    shareUrl: null,
    fileName: null,
    fileSize: null,
    isEncrypted: false,
    password: "",
    createdAt: null,
    isPaused: false,
  });
}

// ============================================================
// HUMAN CHATTER SYSTEM
// ============================================================

let chatterTimer: number | null = null;

const UPLOAD_CHATTER = [
  "Locking your file with military-grade encryption…",
  "Chunks are flying to the cloud, 3 lanes wide…",
  "Still working, big files take a little while. You can browse other pages.",
  "Pushing steadily. Your internet is doing its best.",
  "Receipts are piling up nicely. Stitching happens at the end.",
  "Hang tight, I'll call out when it's done.",
];

function startChatter() {
  stopChatter();
  let i = 0;
  chatterTimer = window.setInterval(() => {
    if (state.status === "uploading" || state.status === "stitching") {
      setState({ chatter: UPLOAD_CHATTER[i % UPLOAD_CHATTER.length] });
      i++;
    }
  }, 8000);
}

function stopChatter() {
  if (chatterTimer !== null) {
    window.clearInterval(chatterTimer);
    chatterTimer = null;
  }
}

// ============================================================
// TAB VISIBILITY DETECTION
// ============================================================

let visibilityListener: (() => void) | null = null;

function setupVisibilityListener() {
  if (visibilityListener) return;

  visibilityListener = () => {
    if (document.hidden) {
      console.log("%c[TAB] Tab hidden — upload will continue in background", "color: orange; font-weight: bold;");
      setState({ isPaused: true, chatter: "Tab hidden — continuing in background…" });
    } else {
      console.log("%c[TAB] Tab visible again — resuming normal operation", "color: green; font-weight: bold;");
      setState({ isPaused: false, chatter: "Tab visible — back to normal" });
    }
  };

  document.addEventListener("visibilitychange", visibilityListener);
  console.log("%c[TAB] Visibility listener attached", "color: blue;");
}

function removeVisibilityListener() {
  if (visibilityListener) {
    document.removeEventListener("visibilitychange", visibilityListener);
    visibilityListener = null;
    console.log("%c[TAB] Visibility listener removed", "color: blue;");
  }
}

// ============================================================
// RESILIENCE HELPERS
// ============================================================

const sleep = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

function waitForOnline(): Promise<void> {
  // A current online connection does not need an online event.
  // Return after a short delay so a transient network failure can retry.
  if (navigator.onLine) {
    return sleep(1500);
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      window.removeEventListener("online", handleOnline);
      resolve();
    }, 5 * 60 * 1000);

    const handleOnline = () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      resolve();
    };

    window.addEventListener("online", handleOnline, { once: true });
  });
}

async function retry<T>(fn: () => Promise<T>, tries: number): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!navigator.onLine) {
        setState({ chatter: "Internet dropped. Waiting for it to come back…" });
        await waitForOnline();
      } else {
        await sleep(1500 * (i + 1));
      }
    }
  }
  throw lastErr;
}

const isNetworkErr = (e: unknown) =>
  !navigator.onLine ||
  e instanceof TypeError ||
  (e instanceof ApiError && ["NETWORK_ERROR", "CHUNK_TIMEOUT"].includes(e.code));

async function hashPassword(password: string): Promise<string> {
  const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================
// PUBLIC START FUNCTION
// ============================================================

export interface UploadConfig {
  file: File;
  password: string;
  isEncrypted: boolean;
  maxDownloads: number;
}

export async function startUpload(cfg: UploadConfig): Promise<void> {
  if (state.status === "encrypting" || state.status === "uploading" || state.status === "stitching") {
    console.warn("%c[ENGINE] Upload already in progress — ignoring duplicate start", "color: red;");
    return;
  }

  console.log("%c[ENGINE] ═══════════════════════════════════════", "color: blue; font-weight: bold;");
  console.log("%c[ENGINE] UPLOAD STARTED", "color: blue; font-weight: bold;");
  console.log(`%c[ENGINE] File: ${cfg.file.name}`, "color: blue;");
  console.log(`%c[ENGINE] Size: ${(cfg.file.size / 1024 / 1024).toFixed(2)} MB`, "color: blue;");
  console.log(`%c[ENGINE] Encrypted: ${cfg.isEncrypted}`, "color: blue;");
  console.log("%c[ENGINE] ═══════════════════════════════════════", "color: blue; font-weight: bold;");

  setState({
    status: "encrypting",
    progress: 0,
    failed: null,
    shareUrl: null,
    fileName: cfg.file.name,
    fileSize: cfg.file.size,
    isEncrypted: cfg.isEncrypted,
    password: cfg.password,
    chatter: "Locking your file on this device…",
    createdAt: null,
    isPaused: false,
  });

  setupVisibilityListener();
  startChatter();

  const t0 = performance.now();

  try {
    const chunkSize = getChunkSize(cfg.file.size);
    const isMultipart = chunkSize > 0;

    console.log(`%c[ENGINE] Chunk size: ${isMultipart ? (chunkSize / 1024 / 1024).toFixed(1) + " MB" : "Single PUT"}`, "color: blue;");
    console.log(`%c[ENGINE] Mode: ${isMultipart ? "MULTIPART" : "SINGLE"}`, "color: blue; font-weight: bold;");

    const shareUrl = isMultipart
      ? await runMultipartWithAutoResume(cfg, chunkSize)
      : await runSingle(cfg);

    setState({
      status: "done",
      progress: 100,
      shareUrl,
      chatter: "Done! Your link is ready.",
      createdAt: Date.now(),
    });

    const totalTime = ((performance.now() - t0) / 1000).toFixed(1);
    console.log(`%c[ENGINE] ═══════════════════════════════════════`, "color: green; font-weight: bold;");
    console.log(`%c[ENGINE] ✅ UPLOAD COMPLETE in ${totalTime}s`, "color: green; font-weight: bold;");
    console.log(`%c[ENGINE] Share URL: ${shareUrl}`, "color: green;");
    console.log(`%c[ENGINE] ═══════════════════════════════════════`, "color: green; font-weight: bold;");
  } catch (err) {
    console.error("%c[ENGINE] ═══════════════════════════════════════", "color: red; font-weight: bold;");
    console.error("%c[ENGINE] ❌ UPLOAD FAILED", "color: red; font-weight: bold;");
    console.error("%c[ENGINE] Error:", err);
    console.error("%c[ENGINE] ═══════════════════════════════════════", "color: red; font-weight: bold;");

    // 🚨 FIX: Deliberate, friendly error messages for specific backend rejections
    let friendlyMsg = !navigator.onLine
      ? "Your internet dropped and didn't come back in time."
      : err instanceof Error
      ? err.message
      : "Upload failed.";

    if (err instanceof ApiError) {
      if (err.code === "DAILY_FILE_LIMIT_EXCEEDED" || err.code === "UPLOAD_QUOTA_EXCEEDED") {
        friendlyMsg = "Daily upload limit reached. Please try again tomorrow!";
      } else if (err.code === "FILE_TOO_LARGE") {
        friendlyMsg = "File is too large. Maximum allowed size is 500MB.";
      } else if (err.code === "BLOCKED_FILE_TYPE" || err.code === "UNSUPPORTED_FILE_TYPE") {
        friendlyMsg = "This file type is not allowed for security reasons. Try zipping it first.";
      }
    }

    setState({
      status: "error",
      failed: friendlyMsg,
    });
  } finally {
    stopChatter();
  }
}

// ============================================================
// PATH A: SINGLE PUT (files < 16MB)
// ============================================================

async function runSingle(cfg: UploadConfig): Promise<string> {
  console.log("%c[SINGLE] Starting single PUT upload", "color: purple; font-weight: bold;");

  let fileToUpload: File | Blob = cfg.file;
  let salt: string | null = null;
  let iv: string | null = null;

  if (cfg.isEncrypted) {
    const encStart = performance.now();
    console.log("%c[SINGLE] Encrypting file…", "color: purple;");
    const enc = await encryptFile(cfg.file, cfg.password);
    fileToUpload = enc.encryptedFile;
    salt = enc.salt;
    iv = enc.iv;
    const encTime = ((performance.now() - encStart) / 1000).toFixed(2);
    console.log(`%c[SINGLE] ✅ Encryption complete in ${encTime}s`, "color: purple;");
  }

  setState({ status: "uploading" });

  const passwordHash = cfg.isEncrypted ? await hashPassword(cfg.password) : null;

  console.log("%c[SINGLE] Requesting presigned URL from backend…", "color: purple;");
  const res = await retry(() => requestUploadUrl({
    originalName: cfg.file.name,
    mimeType: cfg.isEncrypted ? "application/octet-stream" : cfg.file.type,
    sizeBytes: (fileToUpload as File).size,
    isEncrypted: cfg.isEncrypted,
    passwordHash,
    iv,
    salt,
    expirySeconds: 24 * 60 * 60,
    maxDownloads: cfg.maxDownloads,
  }), 3);

  console.log("%c[SINGLE] ✅ Presigned URL received", "color: purple;");
  console.log("%c[SINGLE] Uploading to S3…", "color: purple;");

  const uploadStart = performance.now();

  await retry(() => uploadFileToS3WithProgress(res.data.presignedUrl, fileToUpload as File, {
    onProgress: (p) => {
      setState({ progress: p });
      if (p % 25 === 0 && p > 0) {
        console.log(`%c[SINGLE] Progress: ${p}%`, "color: purple;");
      }
    },
  }), 2);

  const uploadTime = ((performance.now() - uploadStart) / 1000).toFixed(2);
  console.log(`%c[SINGLE] ✅ Upload complete in ${uploadTime}s`, "color: purple;");

  return res.data.shareUrl;
}

// ============================================================
// PATH B: MULTIPART WITH AUTO-RESUME
// ============================================================

async function runMultipartWithAutoResume(cfg: UploadConfig, chunkSize: number): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await runMultipartOnce(cfg, chunkSize);
    } catch (e) {
      if (attempt < 2 && isNetworkErr(e)) {
        console.warn(`%c[MULTIPART] Network error on attempt ${attempt + 1} — auto-resuming`, "color: orange;");
        setState({ chatter: "Connection dropped. Auto-resuming when internet returns…" });
        await waitForOnline();
        continue;
      }
      throw e;
    }
  }
}

async function runMultipartOnce(cfg: UploadConfig, chunkSize: number): Promise<string> {
  const { file } = cfg;
  const totalChunks = Math.ceil(file.size / chunkSize);
  const totalSizeMB = (file.size / 1024 / 1024).toFixed(2);

  console.log("%c[MULTIPART] ═══════════════════════════════════════", "color: cyan; font-weight: bold;");
  console.log(`%c[MULTIPART] Total chunks: ${totalChunks}`, "color: cyan;");
  console.log(`%c[MULTIPART] Chunk size: ${(chunkSize / 1024 / 1024).toFixed(1)} MB`, "color: cyan;");
  console.log(`%c[MULTIPART] Total size: ${totalSizeMB} MB`, "color: cyan;");
  console.log("%c[MULTIPART] ═══════════════════════════════════════", "color: cyan; font-weight: bold;");

  const saved = await loadCheckpoint(file.name, file.size);
  const canResume = !!saved && saved.chunkSize === chunkSize && saved.completedParts.length > 0 && saved.completedParts.length < totalChunks;

  let token: string;
  let uploadId: string;
  let shareUrl: string;
  let resumedParts: { PartNumber: number; ETag: string }[] = [];
  let saltBase64: string | null = null;
  let ivBase64: string | null = null;
  let cryptoKey: CryptoKey | null = null;
  let baseIv: Uint8Array | null = null;

  const passwordHash = cfg.isEncrypted ? await hashPassword(cfg.password) : null;

  if (canResume && saved) {
    console.log(`%c[MULTIPART] 🔄 RESUME DETECTED — ${saved.completedParts.length}/${totalChunks} chunks already done`, "color: green; font-weight: bold;");

    if (cfg.isEncrypted) {
      console.log("%c[MULTIPART] Re-deriving encryption key from password…", "color: green;");
      saltBase64 = saved.saltBase64;
      ivBase64 = saved.baseIvBase64;
      baseIv = base64ToUint8Array(saved.baseIvBase64!);
      cryptoKey = await deriveEncryptionKey(cfg.password, base64ToUint8Array(saved.saltBase64!));
      console.log("%c[MULTIPART] ✅ Key re-derived", "color: green;");
    }

    token = saved.token;
    uploadId = saved.uploadId;
    shareUrl = saved.shareUrl;
    resumedParts = saved.completedParts;

    setState({ chatter: `Resuming: ${resumedParts.length}/${totalChunks} chunks already done.` });
  } else {
    console.log("%c[MULTIPART] 🆕 FRESH START — no resume checkpoint found", "color: cyan;");

    if (cfg.isEncrypted) {
      console.log("%c[MULTIPART] Generating encryption parameters…", "color: cyan;");
      const { salt, baseIv: gen } = generateSaltAndBaseIv();
      baseIv = gen;
      saltBase64 = uint8ArrayToBase64(salt);
      ivBase64 = uint8ArrayToBase64(gen);
      cryptoKey = await deriveEncryptionKey(cfg.password, salt);
      console.log("%c[MULTIPART] ✅ Encryption parameters generated", "color: cyan;");
    }

    console.log("%c[MULTIPART] Requesting multipart session from backend…", "color: cyan;");
    const res = await retry(() => startMultipartUpload({
      originalName: file.name,
      mimeType: cfg.isEncrypted ? "application/octet-stream" : file.type,
      sizeBytes: file.size,
      isEncrypted: cfg.isEncrypted,
      passwordHash,
      iv: ivBase64,
      salt: saltBase64,
      expirySeconds: 24 * 60 * 60,
      maxDownloads: cfg.maxDownloads,
    }), 3);

    token = res.token;
    uploadId = res.uploadId;
    shareUrl = res.shareUrl;

    console.log(`%c[MULTIPART] ✅ Session started — Upload ID: ${uploadId}`, "color: cyan;");

    await saveCheckpoint({
      token,
      uploadId,
      shareUrl,
      fileName: file.name,
      fileSize: file.size,
      chunkSize,
      totalChunks,
      isEncrypted: cfg.isEncrypted,
      saltBase64,
      baseIvBase64: ivBase64,
      completedParts: [],
      savedAt: Date.now(),
    });

    console.log("%c[MULTIPART] ✅ Checkpoint saved to IndexedDB", "color: cyan;");
  }

  setState({ status: "uploading" });

  const partResults: ({ PartNumber: number; ETag: string } | undefined)[] = new Array(totalChunks);
  resumedParts.forEach((p) => {
    partResults[p.PartNumber - 1] = p;
  });

  const done = new Set(resumedParts.map((p) => p.PartNumber - 1));
  let uploadedBytes = 0;

  done.forEach((i) => {
    uploadedBytes += Math.min(chunkSize, file.size - i * chunkSize);
  });

  const totalBytes = file.size + (cfg.isEncrypted ? totalChunks * 16 : 0);

  const initialProgress = Math.round((uploadedBytes / totalBytes) * 100);
  setState({ progress: initialProgress });
  console.log(`%c[MULTIPART] Initial progress: ${initialProgress}%`, "color: cyan;");

  let cursor = 0;
  const grabNext = () => {
    while (cursor < totalChunks) {
      const i = cursor++;
      if (!done.has(i)) {
        done.add(i);
        return i;
      }
    }
    return -1;
  };

  const uploadWorker = async (workerId: number) => {
    while (true) {
      const idx = grabNext();
      if (idx === -1) break;

      const partNumber = idx + 1;
      const chunkStart = performance.now();

      console.log(`%c[WORKER ${workerId}] Starting chunk ${partNumber}/${totalChunks}`, "color: magenta;");

      const chunkBlob = file.slice(idx * chunkSize, Math.min((idx + 1) * chunkSize, file.size));
      let chunkToUpload: Blob = chunkBlob;

      if (cfg.isEncrypted && cryptoKey && baseIv) {
        const encStart = performance.now();
        const encBuf = await encryptChunk(await chunkBlob.arrayBuffer(), cryptoKey, baseIv, idx);
        chunkToUpload = new Blob([encBuf], { type: "application/octet-stream" });
        const encTime = ((performance.now() - encStart) / 1000).toFixed(3);
        console.log(`%c[WORKER ${workerId}] Chunk ${partNumber} encrypted in ${encTime}s`, "color: magenta;");
      }

      const chunkBytes = chunkToUpload.size;
      let bytesReportedForAttempt = 0;

      const etag = await retry(async () => {
        // A failed attempt may have reported partial progress. Remove that
        // uncommitted amount before beginning the next attempt.
        if (bytesReportedForAttempt > 0) {
          uploadedBytes = Math.max(0, uploadedBytes - bytesReportedForAttempt);
          bytesReportedForAttempt = 0;
          setState({
            progress: Math.min(99, Math.round((uploadedBytes / totalBytes) * 100)),
          });
        }

        // A presigned URL is temporary permission for one part. Request a
        // fresh URL for every retry instead of reusing a timed-out URL.
        const presignedUrl = await getPartUploadUrl(token, uploadId, partNumber);
        console.log(`[WORKER ${workerId}] Fresh part URL received`, {
          partNumber,
          urlHost: new URL(presignedUrl).host,
        });

        return uploadChunkWithProgress(presignedUrl, chunkToUpload, {
          onProgress: (pct) => {
            const reportedBytes = Math.round((pct / 100) * chunkBytes);
            const delta = reportedBytes - bytesReportedForAttempt;
            if (delta > 0) {
              bytesReportedForAttempt = reportedBytes;
              uploadedBytes += delta;
              const progress = Math.min(99, Math.round((uploadedBytes / totalBytes) * 100));
              setState({ progress });

              if (pct % 25 === 0 && pct > 0) {
                console.log(`%c[WORKER ${workerId}] Chunk ${partNumber} progress: ${pct}% (overall: ${progress}%)`, "color: magenta;");
              }
            }
          },
        });
      }, 4);

      const chunkTime = ((performance.now() - chunkStart) / 1000).toFixed(2);
      console.log(`%c[WORKER ${workerId}] ✅ Chunk ${partNumber} complete in ${chunkTime}s`, "color: green;");

      partResults[idx] = { PartNumber: partNumber, ETag: etag };

      await saveCheckpoint({
        token,
        uploadId,
        shareUrl,
        fileName: file.name,
        fileSize: file.size,
        chunkSize,
        totalChunks,
        isEncrypted: cfg.isEncrypted,
        saltBase64,
        baseIvBase64: ivBase64,
        completedParts: partResults.filter(Boolean) as { PartNumber: number; ETag: string }[],
        savedAt: Date.now(),
      });
    }
  };

  console.log("%c[MULTIPART] 🚀 Launching 3 parallel upload workers", "color: cyan; font-weight: bold;");

  await Promise.all([uploadWorker(1), uploadWorker(2), uploadWorker(3)]);

  console.log("%c[MULTIPART] ✅ All chunks uploaded — stitching…", "color: cyan; font-weight: bold;");

  setState({ status: "stitching", progress: 100, chatter: "All chunks in. Stitching the file together…" });

  await retry(() => completeMultipartUpload(token, uploadId, partResults as { PartNumber: number; ETag: string }[]), 4);

  console.log("%c[MULTIPART] ✅ File stitched successfully", "color: green; font-weight: bold;");

  await clearCheckpoint(file.name, file.size);
  console.log("%c[MULTIPART] 🗑️ Checkpoint cleared from IndexedDB", "color: green;");

  return shareUrl;
}

// ============================================================
// CANCEL UPLOAD
// ============================================================

export async function cancelUpload(): Promise<void> {
  console.log("%c[ENGINE] ❌ Upload cancelled by user", "color: red; font-weight: bold;");

  if (state.fileName && state.fileSize) {
    const saved = await loadCheckpoint(state.fileName, state.fileSize);
    if (saved) { 
      console.log(`%c[ENGINE] Aborting multipart session: ${saved.uploadId}`, "color: red;");
      abortMultipartUpload(saved.token, saved.uploadId).catch(() => {});
      await clearCheckpoint(saved.fileName, saved.fileSize);
      console.log("%c[ENGINE] 🗑️ Checkpoint cleared", "color: red;");
    }
  }

  resetEngine();
}