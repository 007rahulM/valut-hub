// ============================================
// RESUME STORE — the "Save Game" for uploads
// Lives in IndexedDB (survives F5, crashes, reboots).
// SECURITY: stores ONLY receipts (ETags) and public params.
// NEVER the password, NEVER passwordHash, NEVER file bytes.
// ============================================
import { get, set, del, keys } from "idb-keyval";

export interface UploadCheckpoint {
  token: string;
  uploadId: string;
  shareUrl: string;
  fileName: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
  isEncrypted: boolean;
  saltBase64: string | null;    // needed to re-derive the SAME key on resume
  baseIvBase64: string | null;  // needed to rebuild the SAME per-chunk nonces
  completedParts: { PartNumber: number; ETag: string }[];
  savedAt: number;
}

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // save games expire after 24h

// Fingerprint = name + size. Same file again = same key.
const keyFor = (fileName: string, fileSize: number) => `upload_${fileName}_${fileSize}`;

export async function loadCheckpoint(fileName: string, fileSize: number): Promise<UploadCheckpoint | undefined> {
  const cp = await get<UploadCheckpoint>(keyFor(fileName, fileSize));
  if (!cp) return undefined;
  // Stale save (older than 24h) → throw it away, start fresh
  if (Date.now() - cp.savedAt > MAX_AGE_MS) {
    await del(keyFor(fileName, fileSize));
    return undefined;
  }
  return cp;
}

export async function saveCheckpoint(cp: UploadCheckpoint): Promise<void> {
  await set(keyFor(cp.fileName, cp.fileSize), cp);
}

export async function clearCheckpoint(fileName: string, fileSize: number): Promise<void> {
  await del(keyFor(fileName, fileSize));
}

//-------------------------------------
// LIST ALL PENDING SAVE GAMES
// WHY: On page load (after F5) we scan the hard drive to check
// if there are interrupted uploads that need cleanup.
//-------------------------------------
export async function listCheckpoints(): Promise<UploadCheckpoint[]> {
  const allKeys = (await keys()) as string[];
  const out: UploadCheckpoint[] = [];
  for (const k of allKeys) {
    if (typeof k !== "string" || !k.startsWith("upload_")) continue;
    const cp = await get<UploadCheckpoint>(k);
    if (!cp) continue;
    // same 24h expiry rule as loadCheckpoint
    if (Date.now() - cp.savedAt > MAX_AGE_MS) { await del(k); continue; }
    if (cp.completedParts.length > 0 && cp.completedParts.length < cp.totalChunks) out.push(cp);
  }
  return out;
}