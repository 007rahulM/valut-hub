// // import {
// //   requestUploadUrl,
// //   uploadFileToS3WithProgress,
// //   type ApiResponse,
// // } from "./api";
// // import { encryptFile } from "./crypto";
// // import { hashPasswordV2 } from "./crypto.v2";
// // import { uploadLargeFileV2, type MultipartEventV2, type MultipartProgressV2 } from "./multipart-v2/multipartEngine.v2";

// // export const MULTIPART_THRESHOLD_V2 = 16 * 1024 * 1024;

// // export type UploadEngineProgressV2 = MultipartProgressV2 & { mode: "single" | "multipart" };

// // export type UploadEngineEventV2 = MultipartEventV2 & { mode: "single" | "multipart" };

// // export type UploadEngineOptionsV2 = {
// //   signal?: AbortSignal;
// //   password?: string;
// //   maxDownloads?: number;
// //   expirySeconds?: number;
// //   onProgress?: (progress: UploadEngineProgressV2) => void;
// //   onEvent?: (event: UploadEngineEventV2) => void;
// // };

// // type SingleUploadDataV2 = {
// //   presignedUrl: string;
// //   shareUrl: string;
// // };

// // type UploadResponseV2 = ApiResponse<SingleUploadDataV2> & { data?: SingleUploadDataV2 };

// // function emitSingleEventV2(
// //   options: UploadEngineOptionsV2,
// //   level: MultipartEventV2["level"],
// //   message: string,
// //   details?: Record<string, string | number | boolean>,
// // ): void {
// //   options.onEvent?.({
// //     timestamp: new Date().toLocaleTimeString(),
// //     level,
// //     message,
// //     details,
// //     mode: "single",
// //   });
// // }

// // export async function uploadFileV2(file: File, options: UploadEngineOptionsV2 = {}): Promise<string> {
// //   const encrypted = Boolean(options.password);
// //   const isMultipart = file.size >= MULTIPART_THRESHOLD_V2;
// //   const mode = isMultipart ? "multipart" : "single";
// //   const startedAt = performance.now();

// //   if (isMultipart) {
// //     return uploadLargeFileV2(file, {
// //       signal: options.signal,
// //       password: options.password,
// //       concurrency: 4,
// //       onProgress: (progress) => options.onProgress?.({ ...progress, mode }),
// //       onEvent: (event) => options.onEvent?.({ ...event, mode }),
// //     });
// //   }

// //   emitSingleEventV2(options, "info", `File selected: ${file.name}`, { bytes: file.size });
// //   emitSingleEventV2(options, "info", encrypted ? "Encryption enabled" : "Encryption disabled");

// //   let body: File | Blob = file;
// //   let salt: string | null = null;
// //   let iv: string | null = null;
// //   let passwordHash: string | null = null;

// //   if (encrypted) {
// //     const encryptionStartedAt = performance.now();
// //     emitSingleEventV2(options, "info", "Encrypting the file in this browser");
// //     const encryptedResult = await encryptFile(file, options.password as string);
// //     body = encryptedResult.encryptedFile;
// //     salt = encryptedResult.salt;
// //     iv = encryptedResult.iv;
// //     passwordHash = await hashPasswordV2(options.password as string);
// //     emitSingleEventV2(options, "info", "Encryption finished", { elapsedMs: Math.round(performance.now() - encryptionStartedAt) });
// //   }

// //   emitSingleEventV2(options, "info", "Requesting single-upload permission");
// //   const metadataResponse = await requestUploadUrl({
// //     originalName: file.name,
// //     mimeType: encrypted ? "application/octet-stream" : (file.type || "application/octet-stream"),
// //     sizeBytes: body.size,
// //     isEncrypted: encrypted,
// //     passwordHash,
// //     iv,
// //     salt,
// //     expirySeconds: options.expirySeconds,
// //     maxDownloads: options.maxDownloads,
// //   }) as UploadResponseV2;
// //   const data = metadataResponse.data;
// //   if (!data) throw new Error("Backend returned no single-upload data");
// //   emitSingleEventV2(options, "info", "Single-upload permission received");

// //   const uploadStartedAt = performance.now();
// //   emitSingleEventV2(options, "info", "Uploading the file directly to storage");
// //   await uploadFileToS3WithProgress(data.presignedUrl, body, {
// //     signal: options.signal,
// //     onProgress: (percent) => options.onProgress?.({
// //       percent,
// //       uploadedBytes: Math.round((body.size * percent) / 100),
// //       totalBytes: body.size,
// //       completedParts: percent === 100 ? 1 : 0,
// //       totalParts: 1,
// //       phase: "uploading",
// //       mode: "single",
// //     }),
// //     onStall: () => emitSingleEventV2(options, "warn", "Single upload is quiet; waiting for storage response"),
// //   });
// //   emitSingleEventV2(options, "info", "Single upload finished", { elapsedMs: Math.round(performance.now() - uploadStartedAt) });
// //   emitSingleEventV2(options, "info", "Upload complete", { elapsedMs: Math.round(performance.now() - startedAt) });
// //   return data.shareUrl;
// // }

// // export { uploadLargeFileV2 };
// // export type { MultipartEventV2, MultipartProgressV2 };



// import {
//   requestUploadUrl,
//   uploadFileToS3WithProgress,
//   type ApiResponse,
// } from "./api";
// import { encryptFile } from "./crypto";
// import { hashPasswordV2 } from "./crypto.v2";
// import { uploadLargeFileV2, type MultipartEventV2, type MultipartProgressV2 } from "./multipart-v2/multipartEngine.v2";

// export const MULTIPART_THRESHOLD_V2 = 16 * 1024 * 1024;

// export type UploadEngineProgressV2 = MultipartProgressV2 & { mode: "single" | "multipart" };

// export type UploadEngineEventV2 = MultipartEventV2 & { mode: "single" | "multipart" };

// export type UploadEngineOptionsV2 = {
//   signal?: AbortSignal;
//   password?: string;
//   maxDownloads?: number;
//   expirySeconds?: number;
//   onProgress?: (progress: UploadEngineProgressV2) => void;
//   onEvent?: (event: UploadEngineEventV2) => void;
// };

// type SingleUploadDataV2 = {
//   presignedUrl: string;
//   shareUrl: string;
// };

// type UploadResponseV2 = ApiResponse<SingleUploadDataV2> & { data?: SingleUploadDataV2 };

// function emitSingleEventV2(
//   options: UploadEngineOptionsV2,
//   level: MultipartEventV2["level"],
//   message: string,
//   details?: Record<string, string | number | boolean>,
// ): void {
//   options.onEvent?.({
//     timestamp: new Date().toLocaleTimeString(),
//     level,
//     message,
//     details,
//     mode: "single",
//   });
// }

// export async function uploadFileV2(file: File, options: UploadEngineOptionsV2 = {}): Promise<string> {
//   const encrypted = Boolean(options.password);
//   const isMultipart = file.size >= MULTIPART_THRESHOLD_V2;
//   const mode = isMultipart ? "multipart" : "single";
//   const startedAt = performance.now();

//   if (isMultipart) {
//     return uploadLargeFileV2(file, {
//       signal: options.signal,
//       password: options.password,
//       concurrency: 4,
//       expirySeconds: options.expirySeconds,
//       maxDownloads: options.maxDownloads,
//       onProgress: (progress) => options.onProgress?.({ ...progress, mode }),
//       onEvent: (event) => options.onEvent?.({ ...event, mode }),
//     });
//   }

//   emitSingleEventV2(options, "info", `File selected: ${file.name}`, { bytes: file.size });
//   emitSingleEventV2(options, "info", encrypted ? "Encryption enabled" : "Encryption disabled");

//   let body: File | Blob = file;
//   let salt: string | null = null;
//   let iv: string | null = null;
//   let passwordHash: string | null = null;

//   if (encrypted) {
//     const encryptionStartedAt = performance.now();
//     emitSingleEventV2(options, "info", "Encrypting the file in this browser");
//     const encryptedResult = await encryptFile(file, options.password as string);
//     body = encryptedResult.encryptedFile;
//     salt = encryptedResult.salt;
//     iv = encryptedResult.iv;
//     passwordHash = await hashPasswordV2(options.password as string);
//     emitSingleEventV2(options, "info", "Encryption finished", { elapsedMs: Math.round(performance.now() - encryptionStartedAt) });
//   }

//   emitSingleEventV2(options, "info", "Requesting single-upload permission");
//   const metadataResponse = await requestUploadUrl({
//     originalName: file.name,
//     mimeType: encrypted ? "application/octet-stream" : (file.type || "application/octet-stream"),
//     sizeBytes: body.size,
//     isEncrypted: encrypted,
//     passwordHash,
//     iv,
//     salt,
//     expirySeconds: options.expirySeconds,
//     maxDownloads: options.maxDownloads,
//   }) as UploadResponseV2;
//   const data = metadataResponse.data;
//   if (!data) throw new Error("Backend returned no single-upload data");
//   emitSingleEventV2(options, "info", "Single-upload permission received");

//   const uploadStartedAt = performance.now();
//   emitSingleEventV2(options, "info", "Uploading the file directly to storage");
//   await uploadFileToS3WithProgress(data.presignedUrl, body, {
//     signal: options.signal,
//     onProgress: (percent) => options.onProgress?.({
//       percent,
//       uploadedBytes: Math.round((body.size * percent) / 100),
//       totalBytes: body.size,
//       completedParts: percent === 100 ? 1 : 0,
//       totalParts: 1,
//       phase: "uploading",
//       mode: "single",
//     }),
//     onStall: () => emitSingleEventV2(options, "warn", "Single upload is quiet; waiting for storage response"),
//   });
//   emitSingleEventV2(options, "info", "Single upload finished", { elapsedMs: Math.round(performance.now() - uploadStartedAt) });
//   emitSingleEventV2(options, "info", "Upload complete", { elapsedMs: Math.round(performance.now() - startedAt) });
//   return data.shareUrl;
// }

// export { uploadLargeFileV2 };
// export type { MultipartEventV2, MultipartProgressV2 };




import {
  requestUploadUrl,
  uploadFileToS3WithProgress,
  type ApiResponse,
} from "./api";
import { encryptFile } from "./crypto";
import { hashPasswordV2 } from "./crypto.v2";
import { uploadLargeFileV2, type MultipartEventV2, type MultipartProgressV2 } from "./multipart-v2/multipartEngine.v2";

export const MULTIPART_THRESHOLD_V2 = 16 * 1024 * 1024;

export type UploadEngineProgressV2 = MultipartProgressV2 & { mode: "single" | "multipart" };

export type UploadEngineEventV2 = MultipartEventV2 & { mode: "single" | "multipart" };

export type UploadEngineOptionsV2 = {
  signal?: AbortSignal;
  password?: string;
  maxDownloads?: number;
  expirySeconds?: number;
  onProgress?: (progress: UploadEngineProgressV2) => void;
  onEvent?: (event: UploadEngineEventV2) => void;
};

type SingleUploadDataV2 = {
  presignedUrl: string;
  shareUrl: string;
};

type UploadResponseV2 = ApiResponse<SingleUploadDataV2> & { data?: SingleUploadDataV2 };

function emitSingleEventV2(
  options: UploadEngineOptionsV2,
  level: MultipartEventV2["level"],
  message: string,
  details?: Record<string, string | number | boolean>,
): void {
  options.onEvent?.({
    timestamp: new Date().toLocaleTimeString(),
    level,
    message,
    details,
    mode: "single",
  });
}

export async function uploadFileV2(file: File, options: UploadEngineOptionsV2 = {}): Promise<string> {
  const encrypted = Boolean(options.password);
  const isMultipart = file.size >= MULTIPART_THRESHOLD_V2;
  const mode = isMultipart ? "multipart" : "single";
  const startedAt = performance.now();

  if (isMultipart) {
    return uploadLargeFileV2(file, {
      signal: options.signal,
      password: options.password,
      concurrency: 4,
      expirySeconds: options.expirySeconds,
      maxDownloads: options.maxDownloads,
      onProgress: (progress) => options.onProgress?.({ ...progress, mode }),
      onEvent: (event) => options.onEvent?.({ ...event, mode }),
    });
  }

  emitSingleEventV2(options, "info", `File selected: ${file.name}`, { bytes: file.size });
  emitSingleEventV2(options, "info", encrypted ? "Encryption enabled" : "Encryption disabled");

  let body: File | Blob = file;
  let salt: string | null = null;
  let iv: string | null = null;
  let passwordHash: string | null = null;

  if (encrypted) {
    const encryptionStartedAt = performance.now();
    emitSingleEventV2(options, "info", "Locking your file on this device...");
    const encryptedResult = await encryptFile(file, options.password as string);
    body = encryptedResult.encryptedFile;
    salt = encryptedResult.salt;
    iv = encryptedResult.iv;
    passwordHash = await hashPasswordV2(options.password as string);
    emitSingleEventV2(options, "info", "File encrypted successfully", { elapsedMs: Math.round(performance.now() - encryptionStartedAt) });
  }

  emitSingleEventV2(options, "info", "Requesting upload permission from server...");
  const metadataResponse = await requestUploadUrl({
    originalName: file.name,
    mimeType: encrypted ? "application/octet-stream" : (file.type || "application/octet-stream"),
    sizeBytes: body.size,
    isEncrypted: encrypted,
    passwordHash,
    iv,
    salt,
    expirySeconds: options.expirySeconds,
    maxDownloads: options.maxDownloads,
  }) as UploadResponseV2;
  const data = metadataResponse.data;
  if (!data) throw new Error("Backend returned no single-upload data");
  emitSingleEventV2(options, "info", "Server ready for upload");

  const uploadStartedAt = performance.now();
  emitSingleEventV2(options, "info", "Uploading your file securely...");
  await uploadFileToS3WithProgress(data.presignedUrl, body, {
    signal: options.signal,
    onProgress: (percent) => options.onProgress?.({
      percent,
      uploadedBytes: Math.round((body.size * percent) / 100),
      totalBytes: body.size,
      completedParts: percent === 100 ? 1 : 0,
      totalParts: 1,
      phase: "uploading",
      mode: "single",
    }),
    onStall: () => emitSingleEventV2(options, "warn", "Upload in progress, please wait..."),
  });
  emitSingleEventV2(options, "info", "Upload complete", { elapsedMs: Math.round(performance.now() - uploadStartedAt) });
  emitSingleEventV2(options, "info", "All done! Your link is ready.", { elapsedMs: Math.round(performance.now() - startedAt) });
  return data.shareUrl;
}

export { uploadLargeFileV2 };
export type { MultipartEventV2, MultipartProgressV2 };