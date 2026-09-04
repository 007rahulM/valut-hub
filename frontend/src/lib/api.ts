
//-------------------------------------------------------------------------------
//frontend/src/lib/api.ts//
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Custom Error Class for better error handling
export class ApiError extends Error {
  code: string;
  attemptsLeft?: number;
  maxAttempts?: number;
  retryAfterSeconds?: number;
  lockedUntil?: number;
  
  constructor(message: string, code: string, extra?: { 
    attemptsLeft?: number; 
    maxAttempts?: number; 
    retryAfterSeconds?: number; 
    lockedUntil?: number; 
  }) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    if (extra) {
      this.attemptsLeft = extra.attemptsLeft;
      this.maxAttempts = extra.maxAttempts;
      this.retryAfterSeconds = extra.retryAfterSeconds;
      this.lockedUntil = extra.lockedUntil;
    }
  }
}

// Safe JSON parsing to prevent crashes
async function safeJsonParse(response: Response) {
  try {
    return await response.json();
  } catch {
    throw new ApiError("Server returned invalid response", "INVALID_JSON");
  }
}

// ============================================
// 1. UPLOAD METADATA (Single PUT - files < 16MB)
// ============================================
export async function requestUploadUrl(metadata: {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isEncrypted: boolean;
  passwordHash?: string | null;
  iv?: string | null;
  salt?: string | null;
  expirySeconds?: number;
  maxDownloads?: number;
}) {
  console.log("[API] requestUploadUrl called with:", metadata);
  
  const response = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
    credentials: "include",
  });
  
  const result = await safeJsonParse(response);
  
  if (!response.ok || !result.success) {
    throw new ApiError(
      result.error?.message || "Failed to get upload URL",
      result.error?.code || "UPLOAD_FAILED",
      result.error
    );
  }
  
  console.log("[API] requestUploadUrl success:", result);
  return result;
}

// ============================================
// 2. UPLOAD BYTES TO S3 (Single PUT)
// ============================================
export async function uploadFileToS3(presignedUrl: string, file: File, signal?: AbortSignal) {
  console.log("[API] uploadFileToS3 starting, size:", file.size);
  
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
    signal,
  });
  
  if (!response.ok) throw new ApiError("Failed to upload to S3", "S3_UPLOAD_FAILED");
  
  console.log("[API] uploadFileToS3 complete");
}

// ============================================
// 3. FETCH FILE METADATA
// ============================================
export async function fetchFileMetadata(token: string) {
  console.log("[API] fetchFileMetadata for token:", token);
  
  const response = await fetch(`${API_BASE}/api/file/${token}`, {
    credentials: "include",
  });
  
  const result = await safeJsonParse(response);
  
  if (!response.ok || !result.success) {
    throw new ApiError(
      result.error?.message || "Failed to fetch file",
      result.error?.code || "NOT_FOUND",
      result.error
    );
  }
  
  return result.data;
}

// ============================================
// 4. DOWNLOAD
// ============================================
export interface DownloadResponse {
  downloadUrl: string;
  originalName: string;
  mimeType: string;
  isEncrypted: boolean;
  iv: string | null;
  salt: string | null;
  sizeBytes: number;
}


export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    attemptsLeft?: number;
    maxAttempts?: number;
    retryAfterSeconds?: number;
    lockedUntil?: number;
  };
}

// export async function requestDownloadUrl(token: string, password?: string): Promise<DownloadResponse> {
//   console.log("[API] requestDownloadUrl for token:", token);
  
//   const response = await fetch(`${API_BASE}/api/download/${token}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ password }),
//     credentials: "include",
//   });
  
//   const result: ApiResponse<DownloadResponse> = await safeJsonParse(response);
  
//   if (!response.ok || !result.success) {
//     throw new ApiError(
//       result.error?.message || "Download request failed",
//       result.error?.code || "UNKNOWN_ERROR",
//       result.error
//     );
//   }
  
//   if (!result.data) throw new ApiError("Invalid response from server", "NO_DATA");
  
//   console.log("[API] requestDownloadUrl success");
//   return result.data;
// }


// ============================================
// 4. DOWNLOAD (FIXED TO THROW ApiError FOR PENALTY BOX)
// ============================================
export async function requestDownloadUrl(
  token: string,
  password?: string,
  originalFileName?: string
): Promise<DownloadResponse> {
  const response = await fetch(`${API_BASE}/api/download/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      password,
      originalFileName, 
    }),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new ApiError("Server returned invalid JSON", "INVALID_JSON");
  }

  if (!response.ok || !result.success) {
    // THIS IS THE FIX: Throw ApiError so the UI knows it's a password/lockout issue
    throw new ApiError(
      result.error?.message || "Download request failed",
      result.error?.code || "UNKNOWN_ERROR",
      result.error
    );
  }

  if (!result.data) throw new ApiError("Invalid response from server", "NO_DATA");
  return result.data;
}
// ============================================
// 5. UPLOAD WITH PROGRESS (XHR for progress tracking)
// ============================================
export function uploadFileToS3WithProgress(
  presignedUrl: string,
  file: File | Blob,
  opts: { signal?: AbortSignal; onProgress?: (p: number) => void; onStall?: () => void } = {}
): Promise<void> {
  console.log("[API] uploadFileToS3WithProgress starting");
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let lastMove = Date.now();
    
    // Stall detection
    const stallTimer = window.setInterval(() => {
      if (Date.now() - lastMove > 8000) opts.onStall?.();
    }, 3000);
    
    const clear = () => window.clearInterval(stallTimer);
    
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", (file as File).type || "application/octet-stream");
    
    // Progress tracking
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        lastMove = Date.now();
        const percent = Math.round((e.loaded / e.total) * 100);
        console.log(`[API] Upload progress: ${percent}% (${e.loaded}/${e.total} bytes)`);
        opts.onProgress?.(percent);
      }
    };
    
    xhr.onload = () => {
      clear();
      if (xhr.status < 300) {
        console.log("[API] Upload complete");
        resolve();
      } else {
        reject(new ApiError(`Upload failed (${xhr.status})`, "S3_UPLOAD_FAILED"));
      }
    };
    
    xhr.onerror = () => { clear(); reject(new ApiError("Network error", "NETWORK_ERROR")); };
    xhr.onabort = () => { clear(); reject(new ApiError("Upload cancelled", "CANCELLED")); };
    
    if (opts.signal) {
      if (opts.signal.aborted) { clear(); reject(new ApiError("Upload cancelled", "CANCELLED")); return; }
      opts.signal.addEventListener("abort", () => xhr.abort());
    }
    
    xhr.send(file);
  });
}

//-----------------------------------
// 6. MULTIPART UPLOAD: START
//-----------------------------------
export async function startMultipartUpload(metadata: {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isEncrypted: boolean;
  passwordHash?: string | null;
  iv?: string | null;
  salt?: string | null;
  expirySeconds?: number;
  maxDownloads?: number;
}) {
  console.log("[API] startMultipartUpload called");
  
  const response = await fetch(`${API_BASE}/api/upload/multipart/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
    credentials: "include",
  });
  
  const result = await safeJsonParse(response);
  
  if (!response.ok || !result.success) {
    throw new ApiError(
      result.error?.message || "Failed to start multipart upload",
      result.error?.code || "MULTIPART_START_FAILED",
      result.error
    );
  }
  
  console.log("[API] startMultipartUpload success:", result.data);
  return result.data;
}

//---------------------------------------------------
// 7. MULTIPART UPLOAD: GET PART URL
//---------------------------------------------------
export async function getPartUploadUrl(
  token: string,
  uploadId: string,
  partNumber: number
): Promise<string> {
  console.log(`[API] getPartUploadUrl for part ${partNumber}`);
  
  const response = await fetch(`${API_BASE}/api/upload/multipart/part`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, uploadId, partNumber }),
    credentials: "include",
  });
  
  const result = await safeJsonParse(response);
  
  if (!response.ok || !result.success) {
    throw new ApiError(
      result.error?.message || "Failed to get part upload URL",
      result.error?.code || "PART_URL_FAILED",
      result.error
    );
  }
  
  return result.data.url;
}

//-------------------------------------------
// 8. MULTIPART UPLOAD: COMPLETE
//-------------------------------------------
export async function completeMultipartUpload(
  token: string,
  uploadId: string,
  parts: { PartNumber: number; ETag: string }[]
) {
  console.log(`[API] completeMultipartUpload with ${parts.length} parts`);
  
  const response = await fetch(`${API_BASE}/api/upload/multipart/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, uploadId, parts }),
    credentials: "include",
  });
  
  const result = await safeJsonParse(response);
  
  if (!response.ok || !result.success) {
    throw new ApiError(
      result.error?.message || "Failed to complete multipart upload",
      result.error?.code || "MULTIPART_COMPLETE_FAILED",
      result.error
    );
  }
  
  console.log("[API] completeMultipartUpload success");
  return result;
}

// ... (keep all existing code above uploadChunkWithProgress) ...
// ============================================
// MULTIPART: UPLOAD ONE CHUNK WITH BOUNDED XHR
// This function is used only by the multipart path.
// It does not change the small-file single PUT path.
// ============================================
export function uploadChunkWithProgress(
  presignedUrl: string,
  chunk: Blob,
  opts: { signal?: AbortSignal; onProgress?: (p: number) => void } = {},
): Promise<string> {
  const urlHost = (() => {
    try {
      return new URL(presignedUrl).host;
    } catch {
      return "invalid-url";
    }
  })();

  console.log("[API] multipart chunk XHR starting", {
    sizeBytes: chunk.size,
    sizeMB: (chunk.size / 1024 / 1024).toFixed(2),
    urlHost,
  });

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let settled = false;
    let lastProgressAt = Date.now();

    const abortFromSignal = () => {
      if (settled) return;
      console.warn("[API] multipart chunk abort signal received");
      xhr.abort();
    };

    const cleanup = () => {
      opts.signal?.removeEventListener("abort", abortFromSignal);
    };

    const succeed = (etag: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(etag);
    };

    const fail = (error: ApiError) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    // Keep this shorter than the five-minute presigned URL lifetime.
    // A stuck request must become an actionable error, not an apparent hang.
    xhr.timeout = 60_000;

    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || settled) return;
      lastProgressAt = Date.now();
      const percent = Math.round((event.loaded / event.total) * 100);
      opts.onProgress?.(percent);
    };

    xhr.onload = () => {
      if (settled) return;

      console.log("[API] multipart chunk XHR finished", {
        status: xhr.status,
        readyState: xhr.readyState,
        urlHost,
      });

      if (xhr.status < 300) {
        const etag = xhr.getResponseHeader("ETag");
        if (!etag) {
          console.error("[API] multipart success had no ETag", {
            status: xhr.status,
            urlHost,
          });
          fail(new ApiError("S3 did not expose ETag", "MISSING_ETAG"));
          return;
        }

        console.log("[API] multipart chunk accepted", { urlHost });
        succeed(etag);
        return;
      }

      // Development diagnostic only. Never log the complete presigned URL.
      const responsePreview = (() => {
        try {
          return xhr.responseText.slice(0, 500);
        } catch {
          return "<response body unavailable>";
        }
      })();

      console.error("[API] multipart chunk rejected", {
        status: xhr.status,
        readyState: xhr.readyState,
        urlHost,
        responsePreview,
      });

      fail(new ApiError(`Chunk upload failed (${xhr.status})`, "S3_CHUNK_FAILED"));
    };

    xhr.onerror = () => {
      console.error("[API] multipart chunk network error", {
        status: xhr.status,
        readyState: xhr.readyState,
        urlHost,
        msSinceProgress: Date.now() - lastProgressAt,
      });
      fail(new ApiError("Network error during chunk upload", "NETWORK_ERROR"));
    };

    xhr.ontimeout = () => {
      console.error("[API] multipart chunk timeout", {
        timeoutMs: xhr.timeout,
        status: xhr.status,
        readyState: xhr.readyState,
        urlHost,
        msSinceProgress: Date.now() - lastProgressAt,
      });
      // The browser has already terminated the timed-out request.
      fail(new ApiError("Chunk upload timed out after 60 seconds", "CHUNK_TIMEOUT"));
    };

    xhr.onabort = () => {
      console.warn("[API] multipart chunk aborted", { urlHost });
      fail(new ApiError("Chunk upload cancelled", "CANCELLED"));
    };

    if (opts.signal) {
      if (opts.signal.aborted) {
        fail(new ApiError("Chunk upload cancelled", "CANCELLED"));
        return;
      }
      opts.signal.addEventListener("abort", abortFromSignal, { once: true });
    }

    console.log("[API] multipart chunk sending to S3", {
      sizeBytes: chunk.size,
      urlHost,
    });
    xhr.send(chunk);
  });
}
//-------------------------------------
// 10. ABORT MULTIPART
//-------------------------------------
export async function abortMultipartUpload(token: string, uploadId: string) {
  console.log("[API] abortMultipartUpload");
  
  const response = await fetch(`${API_BASE}/api/upload/multipart/abort`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, uploadId }),
    credentials: "include",
  });
  
  const result = await safeJsonParse(response);
  
  if (!response.ok || !result.success) {
    throw new ApiError(
      result.error?.message || "Failed to abort",
      result.error?.code || "ABORT_FAILED",
      result.error
    );
  }
  
  return result;
}

// ============================================
// 11. CONFIRM DOWNLOAD (Increments count ONLY on success)
// ============================================
// export async function confirmDownload(token: string): Promise<void> {
//   await fetch(`${API_BASE}/api/download/${token}/confirm`, {
//     method: "POST",
//     credentials: "include",
//   });
// }
// ============================================
// 11. CONFIRM DOWNLOAD (Increments count ONLY on success)
// ============================================
export async function confirmDownload(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/download/${token}/confirm`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    // If this network request fails, we don't block the user. 
    // The file is already safely saved to their disk.
    console.warn("Failed to confirm download count, but file is saved.", err);
  }
}