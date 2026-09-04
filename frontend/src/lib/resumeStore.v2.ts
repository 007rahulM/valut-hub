import { del, get, keys, set } from "idb-keyval";

const V2_CHECKPOINT_PREFIX = "sendly_v2_upload_";
const V2_CHECKPOINT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type V2PartReceipt = {
  PartNumber: number;
  ETag: string;
};

export type V2UploadCheckpoint = {
  version: 2;
  token: string;
  uploadId: string;
  shareUrl: string;
  fileName: string;
  fileSize: number;
  partSize: number;
  totalParts: number;
  isEncrypted: boolean;
  passwordHash: string | null;
  saltBase64: string | null;
  baseIvBase64: string | null;
  completedParts: V2PartReceipt[];
  savedAt: number;
};

function checkpointKeyV2(fileName: string, fileSize: number): string {
  return `${V2_CHECKPOINT_PREFIX}${fileName}_${fileSize}`;
}

function isValidCheckpointV2(value: unknown): value is V2UploadCheckpoint {
  if (!value || typeof value !== "object") return false;
  const checkpoint = value as Partial<V2UploadCheckpoint>;
  return checkpoint.version === 2
    && typeof checkpoint.token === "string"
    && typeof checkpoint.uploadId === "string"
    && typeof checkpoint.shareUrl === "string"
    && typeof checkpoint.fileName === "string"
    && typeof checkpoint.fileSize === "number"
    && typeof checkpoint.partSize === "number"
    && typeof checkpoint.totalParts === "number"
    && typeof checkpoint.isEncrypted === "boolean"
    && (checkpoint.passwordHash === null || typeof checkpoint.passwordHash === "string")
    && (checkpoint.saltBase64 === null || typeof checkpoint.saltBase64 === "string")
    && (checkpoint.baseIvBase64 === null || typeof checkpoint.baseIvBase64 === "string")
    && Array.isArray(checkpoint.completedParts)
    && typeof checkpoint.savedAt === "number";
}

export async function loadCheckpointV2(
  fileName: string,
  fileSize: number,
): Promise<V2UploadCheckpoint | undefined> {
  const key = checkpointKeyV2(fileName, fileSize);
  const value = await get<unknown>(key);
  if (!isValidCheckpointV2(value)) {
    if (value !== undefined) await del(key);
    return undefined;
  }
  if (Date.now() - value.savedAt > V2_CHECKPOINT_MAX_AGE_MS) {
    await del(key);
    return undefined;
  }
  return value;
}

export async function saveCheckpointV2(checkpoint: V2UploadCheckpoint): Promise<void> {
  await set(checkpointKeyV2(checkpoint.fileName, checkpoint.fileSize), {
    ...checkpoint,
    completedParts: checkpoint.completedParts
      .slice()
      .sort((left, right) => left.PartNumber - right.PartNumber),
    savedAt: Date.now(),
  });
}

export async function clearCheckpointV2(fileName: string, fileSize: number): Promise<void> {
  await del(checkpointKeyV2(fileName, fileSize));
}

export async function listCheckpointsV2(): Promise<V2UploadCheckpoint[]> {
  const allKeys = await keys();
  const result: V2UploadCheckpoint[] = [];
  for (const key of allKeys) {
    if (typeof key !== "string" || !key.startsWith(V2_CHECKPOINT_PREFIX)) continue;
    const checkpoint = await loadCheckpointV2FromKey(key);
    if (checkpoint && checkpoint.completedParts.length < checkpoint.totalParts) {
      result.push(checkpoint);
    }
  }
  return result;
}

async function loadCheckpointV2FromKey(key: string): Promise<V2UploadCheckpoint | undefined> {
  const value = await get<unknown>(key);
  if (!isValidCheckpointV2(value)) {
    if (value !== undefined) await del(key);
    return undefined;
  }
  if (Date.now() - value.savedAt > V2_CHECKPOINT_MAX_AGE_MS) {
    await del(key);
    return undefined;
  }
  return value;
}
