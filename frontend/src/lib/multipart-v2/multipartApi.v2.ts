import { multipartLogV2 } from "./multipartLogger.v2";

const API_BASE_V2 = import.meta.env.VITE_API_URL || "http://localhost:3001";
const PART_INACTIVITY_TIMEOUT_V2_MS = 5 * 60 * 1000;

export class MultipartApiErrorV2 extends Error {
  readonly code: string;
  readonly status?: number;
  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = "MultipartApiErrorV2";
    this.code = code;
    this.status = status;
  }
}

type ApiErrorBodyV2 = { error?: { code?: string; message?: string } };

async function postJsonV2<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_V2}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let result: T & ApiErrorBodyV2 & { success?: boolean };
  try {
    result = await response.json() as T & ApiErrorBodyV2 & { success?: boolean };
  } catch {
    throw new MultipartApiErrorV2("Backend returned invalid JSON", "INVALID_JSON", response.status);
  }
  if (!response.ok || result.success === false) {
    throw new MultipartApiErrorV2(
      result.error?.message || `Multipart request failed (${response.status})`,
      result.error?.code || "MULTIPART_REQUEST_FAILED",
      response.status,
    );
  }
  return result;
}

export type StartMultipartInputV2 = {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isEncrypted: boolean;
  passwordHash?: string | null;
  iv?: string | null;
  salt?: string | null;
  expirySeconds?: number;
  maxDownloads?: number | null;
};

export type StartMultipartResultV2 = {
  success: true;
  data: { token: string; uploadId: string; shareUrl: string };
};

export function startMultipartV2(input: StartMultipartInputV2): Promise<StartMultipartResultV2> {
  return postJsonV2<StartMultipartResultV2>("/api/v2/upload/multipart/start", input);
}

export async function getMultipartPartUrlV2(token: string, uploadId: string, partNumber: number): Promise<string> {
  const result = await postJsonV2<{ success: true; data: { url: string } }>(
    "/api/v2/upload/multipart/part",
    { token, uploadId, partNumber },
  );
  return result.data.url;
}

export type PartUploadOptionsV2 = {
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
};

export function uploadPartWithProgressV2(
  url: string,
  part: Blob,
  partNumber: number,
  options: PartUploadOptionsV2 = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startedAt = performance.now();
    let settled = false;
    let inactivityTimer: number | undefined;

    const clearTimer = () => {
      if (inactivityTimer !== undefined) window.clearTimeout(inactivityTimer);
      inactivityTimer = undefined;
    };
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimer();
      options.signal?.removeEventListener("abort", abortFromSignal);
      callback();
    };
    const fail = (error: MultipartApiErrorV2) => finish(() => reject(error));
    const resetWatchdog = () => {
      clearTimer();
      inactivityTimer = window.setTimeout(() => {
        fail(new MultipartApiErrorV2("Part upload made no progress for five minutes", "PART_TIMEOUT"));
        xhr.abort();
      }, PART_INACTIVITY_TIMEOUT_V2_MS);
    };
    const abortFromSignal = () => xhr.abort();

    xhr.open("PUT", url, true);
    xhr.timeout = 0;
    resetWatchdog();
    xhr.upload.onprogress = (event) => {
      if (settled) return;
      resetWatchdog();
      if (event.lengthComputable) options.onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        fail(new MultipartApiErrorV2(`S3 rejected part ${partNumber} (${xhr.status})`, "S3_PART_REJECTED", xhr.status));
        return;
      }
      const etag = xhr.getResponseHeader("ETag");
      if (!etag) {
        fail(new MultipartApiErrorV2("S3 accepted the part but did not expose its ETag", "MISSING_ETAG", xhr.status));
        return;
      }
      multipartLogV2.info("part uploaded", { partNumber, bytes: part.size, elapsedMs: Math.round(performance.now() - startedAt) });
      finish(() => resolve(etag));
    };
    xhr.onerror = () => fail(new MultipartApiErrorV2("Network error while uploading part", "PART_NETWORK_ERROR"));
    xhr.ontimeout = () => fail(new MultipartApiErrorV2("Part upload timed out", "PART_TIMEOUT"));
    xhr.onabort = () => fail(new MultipartApiErrorV2("Part upload cancelled", "PART_CANCELLED"));
    if (options.signal?.aborted) {
      fail(new MultipartApiErrorV2("Part upload cancelled", "PART_CANCELLED"));
      return;
    }
    options.signal?.addEventListener("abort", abortFromSignal, { once: true });
    xhr.send(part);
  });
}

export async function completeMultipartV2(token: string, uploadId: string, parts: Array<{ PartNumber: number; ETag: string }>): Promise<void> {
  await postJsonV2("/api/v2/upload/multipart/complete", { token, uploadId, parts });
}

export async function abortMultipartV2(token: string, uploadId: string): Promise<void> {
  await postJsonV2("/api/v2/upload/multipart/abort", { token, uploadId });
}
