

//===========================================
// ============================================================
// DOWNLOAD ENGINE — All 4 patterns implemented (CROSS-ORIGIN FIXED)
// SDE3 UPGRADE: Parallel workers + Key derived ONCE + 16MB fixed chunks
//               + 2-minute inactivity watchdog per chunk (Problem 5)
// ============================================================

import {
  getChunkSize,
} from "./chunkMath";
import {
  loadDownloadCheckpoint,
  saveDownloadCheckpoint,
  clearDownloadCheckpoint,
  saveDecryptedChunk,
  loadDecryptedChunk,
} from "./downloadResumeStore";
import { decryptFileAuto } from "../crypto";

export type DownloadPhase =
  | "starting"
  | "downloading"
  | "decrypting"
  | "combining"
  | "saving"
  | "complete";

export type DownloadProgress = {
  phase: DownloadPhase;
  percent: number;
  downloadedBytes: number;
  totalBytes: number;
  currentChunk?: number;
  totalChunks?: number;
};

export type DownloadOptions = {
  token: string;
  presignedUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isEncrypted: boolean;
  password?: string;
  iv?: string | null;
  salt?: string | null;
  signal?: AbortSignal;
  onProgress?: (progress: DownloadProgress) => void;
  preferFilePicker?: boolean;
};

export async function downloadFile(options: DownloadOptions): Promise<void> {
  const { isEncrypted, fileSize } = options;
  const chunkSize = getChunkSize(fileSize);

  if (!isEncrypted) {
    return patternB_NativeDownload(options);
  } else if (chunkSize === 0) { // < 16MB uses Pattern A
    return patternA_WholeBlob(options);
  } else {
    return patternC_ChunkedDecrypt(options);
  }
}

// ============================================================
// PATTERN B — Native Browser Download (Unencrypted)
// FIX: Use fetch() to prevent cross-origin navigation trap
// ============================================================
async function patternB_NativeDownload(options: DownloadOptions): Promise<void> {
  options.onProgress?.({ phase: "downloading", percent: 0, downloadedBytes: 0, totalBytes: options.fileSize });

  const response = await fetch(options.presignedUrl, { signal: options.signal });
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);

  const blob = await response.blob();
  if (options.signal?.aborted) throw new Error("Download cancelled");

  options.onProgress?.({ phase: "saving", percent: 90, downloadedBytes: options.fileSize, totalBytes: options.fileSize });
  saveBlob(blob, options.fileName);
  options.onProgress?.({ phase: "complete", percent: 100, downloadedBytes: options.fileSize, totalBytes: options.fileSize });
}

// ============================================================
// PATTERN A — Whole Blob (Small Encrypted < 16MB)
// ============================================================
async function patternA_WholeBlob(options: DownloadOptions): Promise<void> {
  const { presignedUrl, fileName, fileSize, password, iv, salt, signal } = options;

  options.onProgress?.({ phase: "downloading", percent: 0, downloadedBytes: 0, totalBytes: fileSize });

  const response = await fetch(presignedUrl, { signal });
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);

  const blob = await response.blob();
  if (signal?.aborted) throw new Error("Download cancelled");

  options.onProgress?.({ phase: "downloading", percent: 50, downloadedBytes: fileSize, totalBytes: fileSize });

  let finalBlob: Blob;

  if (password && iv) {
    options.onProgress?.({ phase: "decrypting", percent: 60, downloadedBytes: fileSize, totalBytes: fileSize });
    const arrayBuffer = await blob.arrayBuffer();

    const decryptedBuffer = await decryptFileAuto(
      arrayBuffer,
      password,
      salt ?? "",
      iv,
      fileSize
    );

    finalBlob = new Blob([decryptedBuffer], { type: options.mimeType });
  } else {
    finalBlob = blob;
  }

  options.onProgress?.({ phase: "saving", percent: 90, downloadedBytes: fileSize, totalBytes: fileSize });
  saveBlob(finalBlob, fileName);
  options.onProgress?.({ phase: "complete", percent: 100, downloadedBytes: fileSize, totalBytes: fileSize });
}

// ============================================================
// 🚨 PROBLEM 5 FIX: CHUNK WATCHDOG
// If NO bytes move for 2 minutes, we abort that chunk and throw a
// friendly error. The user presses Resume -> fresh 5-min URL ->
// engine skips completed chunks and continues. No more silent hangs.
// ============================================================
const CHUNK_INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000;

async function fetchRangeWithWatchdog(
  presignedUrl: string,
  start: number,
  end: number,
  outerSignal: AbortSignal | undefined,
): Promise<ArrayBuffer> {
  const controller = new AbortController();
  let stalled = false;
  let timer: number | undefined;

  const clearTimer = () => {
    if (timer !== undefined) window.clearTimeout(timer);
    timer = undefined;
  };

  const resetTimer = () => {
    clearTimer();
    timer = window.setTimeout(() => {
      stalled = true;
      controller.abort();
    }, CHUNK_INACTIVITY_TIMEOUT_MS);
  };

  const onOuterAbort = () => {
    clearTimer();
    controller.abort();
  };

  if (outerSignal) {
    if (outerSignal.aborted) controller.abort();
    else outerSignal.addEventListener("abort", onOuterAbort, { once: true });
  }

  try {
    resetTimer();
    const response = await fetch(presignedUrl, {
      headers: { Range: `bytes=${start}-${end}` },
      signal: controller.signal,
    });

    if (!response.ok && response.status !== 206) {
      throw new Error(`Chunk failed: HTTP ${response.status}`);
    }

    if (!response.body) {
      // Very old browsers without streaming bodies: buffer as before.
      return await response.arrayBuffer();
    }

    // Stream the body so we can see bytes moving and reset the watchdog.
    const reader = response.body.getReader();
    const pieces: Uint8Array[] = [];
    let received = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value && value.length > 0) {
        resetTimer(); // bytes moved -> connection is alive
        pieces.push(value);
        received += value.length;
      }
    }

    const out = new Uint8Array(received);
    let offset = 0;
    for (const p of pieces) {
      out.set(p, offset);
      offset += p.length;
    }
    return out.buffer as ArrayBuffer;
  } catch (err) {
    // Real user cancel: bubble the original AbortError up unchanged.
    if (outerSignal?.aborted) throw err;
    // Watchdog stall: friendly, resumable error.
    if (stalled) {
      throw new Error("Download stalled: no data for 2 minutes. Press Resume to continue with a fresh link.", { cause: err });
    }
    throw err;
  } finally {
    clearTimer();
    if (outerSignal) outerSignal.removeEventListener("abort", onOuterAbort);
  }
}

// ============================================================
// PATTERN C — Chunked Range + Decrypt (Large Encrypted >= 16MB)
// SDE3 UPGRADE: Parallel workers + Key derived ONCE + 16MB fixed chunks
// ============================================================
async function patternC_ChunkedDecrypt(options: DownloadOptions): Promise<void> {
  const { token, presignedUrl, fileName, fileSize, mimeType, password, iv, salt, signal } = options;

  // 🚨 FIX 1: Force 16MB chunks to perfectly match V2 Upload Engine
  const FIXED_CHUNK_SIZE = 16 * 1024 * 1024;
  const totalChunks = Math.ceil(fileSize / FIXED_CHUNK_SIZE);
  const ENCRYPTED_CHUNK_SIZE = FIXED_CHUNK_SIZE + 16; // 16 bytes for GCM tag

  let checkpoint = await loadDownloadCheckpoint(token);
  if (!checkpoint) {
    checkpoint = {
      token, fileName, fileSize, isEncrypted: true,
      chunkSize: FIXED_CHUNK_SIZE, totalChunks, completedChunks: [], savedAt: Date.now(),
    };
  }

  const useFileSystemAccess = options.preferFilePicker === true && "showSaveFilePicker" in window;
  let writableStream: FileSystemWritableFileStream | null = null;

  if (useFileSystemAccess) {
    try {
      const fileHandle = await (window as unknown as {
        showSaveFilePicker: (options: {
          suggestedName: string;
          types: Array<{ description: string; accept: Record<string, string[]> }>;
        }) => Promise<FileSystemFileHandle>;
      }).showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: "File", accept: { [mimeType]: ["." + (fileName.split(".").pop() || "bin")] } }],
      });
      writableStream = await fileHandle.createWritable();
    } catch { /* Fallback to blob */ }
  }

  const decryptedBlobs: (Blob | null)[] = new Array(totalChunks).fill(null);

  // Load already completed chunks from IndexedDB
  for (const idx of checkpoint.completedChunks) {
    const chunk = await loadDecryptedChunk(token, idx);
    if (chunk) {
      decryptedBlobs[idx] = chunk;
      if (writableStream) await writableStream.write({ type: "write", position: idx * FIXED_CHUNK_SIZE, data: chunk });
    }
  }

  // 🚨 FIX 2: DERIVE THE MASTER KEY **ONCE** BEFORE THE LOOP
  let masterKey: CryptoKey | null = null;
  if (password && salt) {
    options.onProgress?.({ phase: "decrypting", percent: 2, downloadedBytes: 0, totalBytes: fileSize });
    const saltBytes = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
    const keyMaterial = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]
    );
    masterKey = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" },
      keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
    );
  }

  // 🚨 FIX 3: PARALLEL DOWNLOAD WORKERS (2 Workers for safety on mobile RAM)
  const concurrency = 2;
  let nextChunkIndex = 0;
  let completedCount = checkpoint.completedChunks.length;

  const downloadWorker = async () => {
    while (true) {
      if (signal?.aborted) throw new Error("Download cancelled");

      const i = nextChunkIndex++;
      if (i >= totalChunks) break;
      if (decryptedBlobs[i]) continue; // Already done from checkpoint

      const start = i * ENCRYPTED_CHUNK_SIZE;
      const plainChunkSize = (i === totalChunks - 1)
          ? (fileSize - (i * FIXED_CHUNK_SIZE))
          : FIXED_CHUNK_SIZE;
      const encryptedChunkSize = plainChunkSize + 16;
      const end = start + encryptedChunkSize - 1;

      // 🚨 FIX 5 (WATCHDOG): fetch with 2-minute inactivity abort
      const chunkArrayBuffer = await fetchRangeWithWatchdog(presignedUrl, start, end, signal);

      let decryptedChunk: ArrayBuffer;

      if (masterKey && iv) {
        // Announce decrypt step for UI
        options.onProgress?.({
          phase: "decrypting",
          percent: Math.min(90, Math.round(((i + 0.5) / totalChunks) * 90)),
          downloadedBytes: Math.min(fileSize, Math.round((i + 0.5) * (fileSize / totalChunks))),
          totalBytes: fileSize,
        });
        // Use the pre-derived master key! Extremely fast now.
        decryptedChunk = await decryptChunkWithKey(chunkArrayBuffer, masterKey, iv, i);
      } else {
        decryptedChunk = chunkArrayBuffer;
      }

      const chunkBlob = new Blob([decryptedChunk]);
      await saveDecryptedChunk(token, i, chunkBlob);
      decryptedBlobs[i] = chunkBlob;

      if (!checkpoint.completedChunks.includes(i)) {
          checkpoint.completedChunks.push(i);
          await saveDownloadCheckpoint(checkpoint);
      }

      if (writableStream) {
          await writableStream.write({ type: "write", position: i * FIXED_CHUNK_SIZE, data: chunkBlob });
      }

      completedCount++;
      const percent = Math.round((completedCount / totalChunks) * 90);
      options.onProgress?.({
        phase: "downloading", percent, downloadedBytes: completedCount * FIXED_CHUNK_SIZE,
        totalBytes: fileSize, currentChunk: completedCount, totalChunks,
      });
    }
  };

  // Launch the workers
  await Promise.all(Array.from({ length: concurrency }, () => downloadWorker()));

  if (!writableStream) {
    options.onProgress?.({ phase: "combining", percent: 95, downloadedBytes: fileSize, totalBytes: fileSize });
    const finalBlob = new Blob(decryptedBlobs as Blob[], { type: mimeType });
    options.onProgress?.({ phase: "saving", percent: 98, downloadedBytes: fileSize, totalBytes: fileSize });
    saveBlob(finalBlob, fileName);
  } else {
    await writableStream.close();
  }

  await clearDownloadCheckpoint(token);
  options.onProgress?.({ phase: "complete", percent: 100, downloadedBytes: fileSize, totalBytes: fileSize });
}

// ============================================================
// NEW CHUNK DECRYPTOR (Uses pre-derived key, extremely fast)
// ============================================================
async function decryptChunkWithKey(
  chunkData: ArrayBuffer,
  key: CryptoKey,
  baseIvBase64: string,
  chunkIndex: number
): Promise<ArrayBuffer> {
  const baseIvBytes = Uint8Array.from(atob(baseIvBase64), (c) => c.charCodeAt(0));
  const nonce = new Uint8Array(12);
  nonce.set(baseIvBytes, 0);
  const view = new DataView(nonce.buffer);
  view.setUint32(8, chunkIndex, false);
  return await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, key, chunkData);
}

function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 60000);
}

export function getChunkIvOffset(chunkIndex: number): number {
  return chunkIndex;
}