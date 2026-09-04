// ============================================================
// DOWNLOAD RESUME STORE — "Save Game" for downloads
// Stores: checkpoint metadata + decrypted chunk blobs
// SECURITY: Never stores passwords or encryption keys
// WHY: If user's phone dies at 80%, they can resume tomorrow
// ============================================================

import { get, set, del, keys } from "idb-keyval";

export interface DownloadCheckpoint {
  token: string;
  fileName: string;
  fileSize: number;
  isEncrypted: boolean;
  chunkSize: number;
  totalChunks: number;
  completedChunks: number[]; // Indices of successfully downloaded+decrypted chunks
  savedAt: number;
}

const PREFIX = "dl_";
const CHUNK_PREFIX = "dlchunk_";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

function keyFor(token: string): string {
  return `${PREFIX}${token}`;
}

function chunkKeyFor(token: string, index: number): string {
  return `${CHUNK_PREFIX}${token}_${index}`;
}

/**
 * Load an existing download checkpoint
 * Returns undefined if none exists or it's stale (>24h old)
 */
export async function loadDownloadCheckpoint(
  token: string
): Promise<DownloadCheckpoint | undefined> {
  const cp = await get<DownloadCheckpoint>(keyFor(token));
  if (!cp) return undefined;

  // Stale checkpoint → delete it
  if (Date.now() - cp.savedAt > MAX_AGE_MS) {
    await clearDownloadCheckpoint(token);
    return undefined;
  }

  return cp;
}

/**
 * Save/update a download checkpoint
 */
export async function saveDownloadCheckpoint(
  cp: DownloadCheckpoint
): Promise<void> {
  await set(keyFor(cp.token), { ...cp, savedAt: Date.now() });
}

/**
 * Clear a download checkpoint AND all its stored chunks
 * WHY: Prevents orphaned blobs from eating storage forever
 */
export async function clearDownloadCheckpoint(token: string): Promise<void> {
  await del(keyFor(token));

  // Clear all stored chunks for this download
  const allKeys = await keys();
  for (const k of allKeys) {
    if (typeof k === "string" && k.startsWith(`${CHUNK_PREFIX}${token}_`)) {
      await del(k);
    }
  }
}

/**
 * Store a decrypted chunk as a Blob in IndexedDB
 * WHY: Blobs are stored out-of-line by browser (efficient for large data)
 */
export async function saveDecryptedChunk(
  token: string,
  index: number,
  blob: Blob
): Promise<void> {
  await set(chunkKeyFor(token, index), blob);
}

/**
 * Load a previously decrypted chunk from IndexedDB
 */
export async function loadDecryptedChunk(
  token: string,
  index: number
): Promise<Blob | undefined> {
  return await get<Blob>(chunkKeyFor(token, index));
}

/**
 * List all incomplete downloads
 * WHY: Show user "You have 2 interrupted downloads" on page load
 */
export async function listIncompleteDownloads(): Promise<DownloadCheckpoint[]> {
  const allKeys = await keys();
  const result: DownloadCheckpoint[] = [];

  for (const k of allKeys) {
    if (typeof k !== "string" || !k.startsWith(PREFIX)) continue;
    if (k.startsWith(CHUNK_PREFIX)) continue;

    const cp = await get<DownloadCheckpoint>(k);
    if (!cp) continue;

    if (Date.now() - cp.savedAt > MAX_AGE_MS) {
      await clearDownloadCheckpoint(cp.token);
      continue;
    }

    if (cp.completedChunks.length < cp.totalChunks) {
      result.push(cp);
    }
  }

  return result;
}