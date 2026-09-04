
import {
  abortMultipartV2,
  completeMultipartV2,
  getMultipartPartUrlV2,
  MultipartApiErrorV2,
  startMultipartV2,
  uploadPartWithProgressV2,
} from "./multipartApi.v2";
import { multipartLogV2 } from "./multipartLogger.v2";
import {
  base64ToUint8ArrayV2,
  createEncryptionMaterialV2,
  hashPasswordV2,
  deriveEncryptionKeyV2,
  encryptPartV2,
} from "../crypto.v2";
import {
  clearCheckpointV2,
  loadCheckpointV2,
  saveCheckpointV2,
  type V2PartReceipt,
  type V2UploadCheckpoint,
} from "../resumeStore.v2";

export const MULTIPART_PART_SIZE_V2 = 16 * 1024 * 1024;
export const MULTIPART_CONCURRENCY_V2 = 4;
const MAX_PART_ATTEMPTS_V2 = 3;
const RETRY_BASE_DELAY_V2_MS = 1_000;

export type MultipartProgressV2 = {
  percent: number;
  uploadedBytes: number;
  totalBytes: number;
  completedParts: number;
  totalParts: number;
  phase: "starting" | "encrypting" | "uploading" | "completing" | "complete";
};

export type MultipartEventV2 = {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  details?: Record<string, string | number | boolean>;
};

export type UploadLargeFileOptionsV2 = {
  signal?: AbortSignal;
  password?: string;
  passwordHash?: string | null;
  concurrency?: number;
  expirySeconds?: number;
  maxDownloads?: number | null;
  onProgress?: (progress: MultipartProgressV2) => void;
  onEvent?: (event: MultipartEventV2) => void;
};

function emitEventV2(
  options: UploadLargeFileOptionsV2,
  level: MultipartEventV2["level"],
  message: string,
  details?: Record<string, string | number | boolean>,
): void {
  options.onEvent?.({ timestamp: new Date().toLocaleTimeString(), level, message, details });
  const logDetails = details as Record<string, unknown> | undefined;
  if (level === "error") multipartLogV2.error(message, logDetails);
  else if (level === "warn") multipartLogV2.warn(message, logDetails);
  else multipartLogV2.info(message, logDetails);
}

function sleepV2(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function isRetryableV2(error: unknown): boolean {
  return error instanceof MultipartApiErrorV2
    && (error.code === "PART_NETWORK_ERROR" || error.code === "PART_TIMEOUT");
}

function isCancelledV2(error: unknown): boolean {
  return error instanceof MultipartApiErrorV2 && error.code === "PART_CANCELLED";
}

async function uploadPartWithRetryV2(
  token: string,
  uploadId: string,
  partNumber: number,
  part: Blob,
  controller: AbortController,
  onProgress: (percent: number) => void,
  onEvent: (level: MultipartEventV2["level"], message: string, details?: Record<string, string | number | boolean>) => void,
): Promise<string> {
  for (let attempt = 1; attempt <= MAX_PART_ATTEMPTS_V2; attempt += 1) {
    try {
      onEvent("info", `Part ${partNumber}: requesting signed upload permission`, { partNumber, attempt });
      const url = await getMultipartPartUrlV2(token, uploadId, partNumber);
      onEvent("info", `Part ${partNumber}: sending bytes to S3`, { partNumber, attempt, bytes: part.size });
      return await uploadPartWithProgressV2(url, part, partNumber, {
        signal: controller.signal,
        onProgress,
      });
    } catch (error) {
      if (!isRetryableV2(error) || attempt === MAX_PART_ATTEMPTS_V2) throw error;
      const delay = RETRY_BASE_DELAY_V2_MS * 2 ** (attempt - 1);
      onEvent("warn", `Part ${partNumber}: retry ${attempt + 1} after temporary failure`, { partNumber, attempt, delay });
      multipartLogV2.warn("retrying part", { partNumber, attempt, delay });
      await sleepV2(delay);
    }
  }
  throw new Error(`Part ${partNumber} exhausted its retry attempts`);
}

function dedupeReceiptsV2(receipts: V2PartReceipt[]): V2PartReceipt[] {
  return Array.from(new Map(receipts.map((receipt) => [receipt.PartNumber, receipt])).values());
}

export async function uploadLargeFileV2(
  file: File,
  options: UploadLargeFileOptionsV2 = {},
): Promise<string> {
  emitEventV2(options, "info", `File selected: ${file.name}`, { bytes: file.size });
  if (file.size < MULTIPART_PART_SIZE_V2) {
    throw new Error("V2 multipart requires a file of at least 16 MiB");
  }

  const totalParts = Math.ceil(file.size / MULTIPART_PART_SIZE_V2);
  const concurrency = Math.max(1, Math.min(options.concurrency ?? MULTIPART_CONCURRENCY_V2, totalParts));
  const encrypted = Boolean(options.password);
  emitEventV2(options, "info", encrypted ? "Encryption enabled" : "Encryption disabled", { encrypted, totalParts, concurrency });
  const passwordHash = encrypted
    ? (options.passwordHash ?? await hashPasswordV2(options.password as string))
    : null;
  const uploadStartedAt = performance.now();
  const controller = new AbortController();
  let checkpoint = await loadCheckpointV2(file.name, file.size);
  emitEventV2(options, "info", checkpoint ? `Resume checkpoint found: ${checkpoint.completedParts.length} parts already saved` : "No resume checkpoint found; starting a new upload", { resumed: Boolean(checkpoint) });

  if (checkpoint && (
    checkpoint.partSize !== MULTIPART_PART_SIZE_V2
    || checkpoint.totalParts !== totalParts
    || checkpoint.isEncrypted !== encrypted
    || checkpoint.passwordHash !== passwordHash
  )) {
    emitEventV2(options, "warn", "Old checkpoint does not match this upload password; starting a new safe session");
    await clearCheckpointV2(file.name, file.size);
    checkpoint = undefined;
  }

  let saltBase64: string | null = checkpoint?.saltBase64 ?? null;
  let baseIvBase64: string | null = checkpoint?.baseIvBase64 ?? null;
  let key: CryptoKey | undefined;
  if (encrypted) {
    const encryptionStartedAt = performance.now();
    if (!saltBase64 || !baseIvBase64) {
      const material = createEncryptionMaterialV2();
      saltBase64 = material.saltBase64;
      baseIvBase64 = material.baseIvBase64;
    }
    key = await deriveEncryptionKeyV2(options.password as string, base64ToUint8ArrayV2(saltBase64));
    emitEventV2(options, "info", "Encryption key ready", { elapsedMs: Math.round(performance.now() - encryptionStartedAt) });
  }

  let token: string;
  let uploadId: string;
  let shareUrl: string;
  const completed = new Map<number, string>();

  if (checkpoint) {
    token = checkpoint.token;
    uploadId = checkpoint.uploadId;
    shareUrl = checkpoint.shareUrl;
    for (const receipt of dedupeReceiptsV2(checkpoint.completedParts)) {
      completed.set(receipt.PartNumber, receipt.ETag);
    }
  } else {
    emitEventV2(options, "info", "Asking backend to start multipart session");
    const started = await startMultipartV2({
      originalName: file.name,
      mimeType: encrypted ? "application/octet-stream" : (file.type || "application/octet-stream"),
      sizeBytes: file.size,
      isEncrypted: encrypted,
      passwordHash,
      iv: baseIvBase64,
      salt: saltBase64,
      expirySeconds: options.expirySeconds,
      maxDownloads: options.maxDownloads,
    });
    token = started.data.token;
    uploadId = started.data.uploadId;
    shareUrl = started.data.shareUrl;
    emitEventV2(options, "info", "Backend session created", { totalParts });
  }

  const partProgress = new Map<number, number>();
  let saveChain: Promise<void> = Promise.resolve();
  const saveProgressV2 = (): Promise<void> => {
    const nextCheckpoint: V2UploadCheckpoint = {
      version: 2,
      token,
      uploadId,
      shareUrl,
      fileName: file.name,
      fileSize: file.size,
      partSize: MULTIPART_PART_SIZE_V2,
      totalParts,
      isEncrypted: encrypted,
      passwordHash,
      saltBase64,
      baseIvBase64,
      completedParts: Array.from(completed.entries()).map(([PartNumber, ETag]) => ({ PartNumber, ETag })),
      savedAt: Date.now(),
    };
    saveChain = saveChain.then(() => saveCheckpointV2(nextCheckpoint));
    return saveChain;
  };

  const reportV2 = (phase: MultipartProgressV2["phase"], forceComplete = false): void => {
    const uploadedBytes = Array.from(partProgress.values()).reduce((sum, value) => sum + value, 0);
    options.onProgress?.({
      percent: forceComplete ? 100 : Math.min(99, Math.round((uploadedBytes / file.size) * 100)),
      uploadedBytes,
      totalBytes: file.size,
      completedParts: completed.size,
      totalParts,
      phase,
    });
  };

  const forwardAbort = () => controller.abort();
  options.signal?.addEventListener("abort", forwardAbort, { once: true });
  let nextPartIndex = 0;

  const workerV2 = async (): Promise<void> => {
    while (!controller.signal.aborted) {
      const partIndex = nextPartIndex;
      nextPartIndex += 1;
      const partNumber = partIndex + 1;
      if (partNumber > totalParts) return;
      if (completed.has(partNumber)) continue;

      const start = partIndex * MULTIPART_PART_SIZE_V2;
      const end = Math.min(start + MULTIPART_PART_SIZE_V2, file.size);
      const partStartedAt = performance.now();
      const plaintext = file.slice(start, end);
      emitEventV2(options, "info", `Part ${partNumber}: prepared`, { partNumber, bytes: plaintext.size });
      reportV2(encrypted ? "encrypting" : "uploading");
      const body = encrypted
        ? await encryptPartV2(
          await plaintext.arrayBuffer(),
          key as CryptoKey,
          base64ToUint8ArrayV2(baseIvBase64 as string),
          partIndex,
        )
        : plaintext;
      if (encrypted) emitEventV2(options, "info", `Part ${partNumber}: encrypted on this device`, { partNumber, bytes: body.size, elapsedMs: Math.round(performance.now() - partStartedAt) });

      const etag = await uploadPartWithRetryV2(
        token,
        uploadId,
        partNumber,
        body,
        controller,
        (percent) => {
          if (percent === 100) emitEventV2(options, "info", `Part ${partNumber}: S3 upload finished`, { partNumber });
          partProgress.set(partNumber, Math.round((percent / 100) * plaintext.size));
          reportV2("uploading");
        },
        (level, message, details) => emitEventV2(options, level, message, details),
      );
      completed.set(partNumber, etag);
      emitEventV2(options, "info", `Part ${partNumber}: ETag received`, { partNumber, elapsedMs: Math.round(performance.now() - partStartedAt) });
      partProgress.set(partNumber, plaintext.size);
      await saveProgressV2();
      emitEventV2(options, "info", `Checkpoint saved: ${completed.size}/${totalParts} parts`, { completedParts: completed.size, totalParts });
      reportV2("uploading");
    }
  };

  try {
    reportV2("starting");
    await Promise.all(Array.from({ length: concurrency }, () => workerV2()));
    if (controller.signal.aborted) {
      throw new MultipartApiErrorV2("Multipart upload cancelled", "PART_CANCELLED");
    }

    const parts = Array.from(completed.entries())
      .sort(([left], [right]) => left - right)
      .map(([PartNumber, ETag]) => ({ PartNumber, ETag }));
    if (parts.length !== totalParts) throw new Error(`Only ${parts.length} of ${totalParts} parts completed`);

    emitEventV2(options, "info", "All parts finished; asking backend to complete the upload", { totalParts });
    reportV2("completing");
    await completeMultipartV2(token, uploadId, parts);
    await clearCheckpointV2(file.name, file.size);
    emitEventV2(options, "info", "Upload complete; checkpoint cleared", { elapsedMs: Math.round(performance.now() - uploadStartedAt) });
    reportV2("complete", true);
    return shareUrl;
  } catch (error) {
    controller.abort();
    if (isCancelledV2(error) || options.signal?.aborted) {
      emitEventV2(options, "warn", "Upload cancelled; aborting S3 session and clearing checkpoint");
      await abortMultipartV2(token, uploadId).catch(() => undefined);
      await clearCheckpointV2(file.name, file.size);
    } else {
      await saveProgressV2();
      emitEventV2(options, "warn", "Upload paused; checkpoint retained for Try Again / Resume Upload");
      multipartLogV2.warn("upload paused; checkpoint retained for resume", {
        completedParts: completed.size,
        totalParts,
      });
    }
      emitEventV2(options, "error", `Upload failed: ${error instanceof Error ? error.message : "unknown error"}`, { elapsedMs: Math.round(performance.now() - uploadStartedAt) });
    throw error;
  } finally {
    options.signal?.removeEventListener("abort", forwardAbort);
  }
}
