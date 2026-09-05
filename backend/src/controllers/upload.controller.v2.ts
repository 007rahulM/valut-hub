// import type { Request, Response } from "express";
// import crypto from "node:crypto";
// import prisma from "../lib/prisma";
// import {
//   abortMultipartUploadV2,
//   completeMultipartUploadV2,
//   generatePartUploadUrlV2,
//   startMultipartUploadV2,
// } from "../services/s3Service.v2";

// /**
//  * Sendly multipart controller V2.
//  *
//  * This file is a new version. It does not replace upload.controller.ts.
//  * It receives small JSON descriptions and coordinates S3. It never receives
//  * the large file bytes themselves.
//  */

// const isDevelopment = process.env.NODE_ENV !== "production";
// const multipartLog = (message: string, details?: Record<string, unknown>): void => {
//   if (isDevelopment) {
//     console.info(`[MULTIPART V2] ${message}`, details ?? "");
//   }
// };

// const multipartLogError = (message: string, details?: Record<string, unknown>): void => {
//   if (isDevelopment) {
//     console.error(`[MULTIPART V2] ${message}`, details ?? "");
//   }
// };

// const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;
// const PART_SIZE_BYTES = 16 * 1024 * 1024;
// const DEFAULT_EXPIRY_SECONDS = 24 * 60 * 60;
// const MAX_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

// const ALLOWED_MIMES = [
//   "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml",
//   "image/heic", "image/heif", "image/avif", "image/vnd.microsoft.icon",
//   "video/mp4", "video/webm", "video/ogg", "video/x-matroska", "video/quicktime",
//   "video/x-msvideo", "video/mpeg", "video/3gpp", "video/3gpp2",
//   "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac", "audio/webm",
//   "audio/midi", "audio/x-m4a", "audio/opus",
//   "application/pdf", "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "application/vnd.ms-excel",
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   "application/vnd.ms-powerpoint",
//   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//   "application/vnd.oasis.opendocument.text", "application/vnd.oasis.opendocument.spreadsheet",
//   "application/vnd.oasis.opendocument.presentation", "application/rtf",
//   "text/plain", "text/csv", "application/epub+zip",
//   "application/zip", "application/x-zip-compressed", "application/x-rar-compressed",
//   "application/vnd.rar", "application/x-7z-compressed", "application/gzip", "application/x-gzip",
//   "application/x-bzip2", "application/x-tar",
//   "font/ttf", "font/otf", "font/woff", "font/woff2",
//   "text/html", "text/css", "text/javascript", "application/javascript", "application/json",
//   "application/xml", "text/xml", "text/markdown", "application/x-yaml",
// ];

// const BLOCKED_EXTENSIONS = [
//   ".exe", ".msi", ".msp", ".mst", ".bat", ".cmd", ".com", ".scr", ".pif",
//   ".vbs", ".vbe", ".js", ".jse", ".wsf", ".wsh", ".ps1", ".psm1", ".hta",
//   ".cpl", ".lnk", ".reg", ".dll", ".sys", ".drv", ".iso", ".img", ".vhd",
//   ".vhdx", ".apk", ".jar", ".sh", ".bash", ".cgi", ".docm", ".xlsm", ".pptm",
// ];

// type StartMultipartBody = {
//   originalName: string;
//   mimeType: string;
//   sizeBytes: number;
//   isEncrypted?: boolean;
//   passwordHash?: string | null;
//   iv?: string | null;
//   salt?: string | null;
//   expirySeconds?: number;
//   maxDownloads?: number | null;
// };

// type SessionBody = {
//   token: string;
//   uploadId: string;
// };

// type PartUrlBody = SessionBody & {
//   partNumber: number;
// };

// type CompleteBody = SessionBody & {
//   parts: Array<{ PartNumber: number; ETag: string }>;
// };

// function sendError(res: Response, status: number, code: string, message: string) {
//   return res.status(status).json({
//     success: false,
//     error: { code, message },
//   });
// }

// function validateStartBody(body: unknown): string | null {
//   const data = body as Partial<StartMultipartBody>;

//   if (
//     typeof data.originalName !== "string" || data.originalName.trim() === "" ||
//     typeof data.mimeType !== "string" || data.mimeType.trim() === "" ||
//     typeof data.sizeBytes !== "number" || !Number.isFinite(data.sizeBytes) || data.sizeBytes <= 0
//   ) {
//     return "Missing or invalid file metadata";
//   }

//   if (data.sizeBytes < PART_SIZE_BYTES) {
//     return "Multipart V2 requires a file of at least 16 MiB";
//   }

//   if (data.sizeBytes > MAX_FILE_SIZE_BYTES) {
//     return "File exceeds the maximum allowed size of 500MB";
//   }

//   const lowerName = data.originalName.toLowerCase();
//   if (BLOCKED_EXTENSIONS.some((extension) => lowerName.endsWith(extension))) {
//     return "This file type is blocked for security reasons";
//   }

//   const allowedMimes = data.isEncrypted
//     ? [...ALLOWED_MIMES, "application/octet-stream"]
//     : ALLOWED_MIMES;

//   if (!allowedMimes.includes(data.mimeType)) {
//     return "This file type is not allowed for security reasons";
//   }

//   if (
//     data.expirySeconds !== undefined &&
//     (!Number.isInteger(data.expirySeconds) || data.expirySeconds < 60 || data.expirySeconds > MAX_EXPIRY_SECONDS)
//   ) {
//     return "Invalid expiry period";
//   }

//   if (
//     data.maxDownloads !== undefined && data.maxDownloads !== null &&
//     (!Number.isInteger(data.maxDownloads) || data.maxDownloads < 1 || data.maxDownloads > 100)
//   ) {
//     return "Invalid maximum download count";
//   }

//   return null;
// }

// export async function startMultipartV2(req: Request, res: Response) {
//   const body = req.body as StartMultipartBody;
//   const validationError = validateStartBody(body);
//   if (validationError) return sendError(res, 400, "INVALID_INPUT", validationError);

//   const token = crypto.randomUUID();
//   const storedName = `${crypto.randomUUID()}-${body.originalName}`;
//   const expirySeconds = body.expirySeconds ?? DEFAULT_EXPIRY_SECONDS;
//   const expiresAt = new Date(Date.now() + expirySeconds * 1000);
//   let uploadId: string | null = null;

//   try {
//     multipartLog("start requested", {
//       fileName: body.originalName,
//       sizeBytes: body.sizeBytes,
//       isEncrypted: Boolean(body.isEncrypted),
//     });

//     const createdUploadId = await startMultipartUploadV2(storedName, body.mimeType);
//     uploadId = createdUploadId;

//     const file = await prisma.file.create({
//       data: {
//         token,
//         originalName: body.originalName,
//         storedName,
//         mimeType: body.mimeType,
//         sizeBytes: body.sizeBytes,
//         isEncrypted: Boolean(body.isEncrypted),
//         passwordHash: body.passwordHash || null,
//         iv: body.iv || null,
//         salt: body.salt || null,
//         expiresAt,
//         maxDownloads: body.maxDownloads ?? 10,
//         status: "UPLOADING",
//         uploadId: createdUploadId,
//       },
//     });

//     multipartLog("start completed", {
//       tokenPrefix: token.slice(0, 8),
//       uploadIdPrefix: createdUploadId.slice(0, 8),
//     });

//     return res.json({
//       success: true,
//       data: {
//         token: file.token,
//         uploadId: createdUploadId,
//         shareUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/file/${file.token}`,
//       },
//     });
//   } catch (error) {
//     if (uploadId) {
//       await abortMultipartUploadV2(storedName, uploadId).catch(() => undefined);
//     }

//     multipartLogError("start failed", {
//       error: error instanceof Error ? error.message : "unknown error",
//     });
//     return sendError(res, 500, "MULTIPART_START_FAILED", "Failed to start multipart upload");
//   }
// }

// export async function getPartUrlV2(req: Request, res: Response) {
//   const { token, uploadId, partNumber } = req.body as PartUrlBody;

//   if (
//     typeof token !== "string" || token.length === 0 ||
//     typeof uploadId !== "string" || uploadId.length === 0 ||
//     !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10_000
//   ) {
//     return sendError(res, 400, "INVALID_PART_REQUEST", "Invalid part request");
//   }

//   try {
//     const file = await prisma.file.findUnique({ where: { token } });
//     if (!file || file.isDeleted || file.status !== "UPLOADING" || file.uploadId !== uploadId) {
//       return sendError(res, 404, "SESSION_NOT_FOUND", "Multipart session is not active");
//     }

//     const url = await generatePartUploadUrlV2(file.storedName, uploadId, partNumber);
//     multipartLog("part URL created", {
//       partNumber,
//       host: new URL(url).host,
//       uploadIdPrefix: uploadId.slice(0, 8),
//     });

//     return res.json({ success: true, data: { url } });
//   } catch (error) {
//     multipartLogError("part URL failed", {
//       partNumber,
//       error: error instanceof Error ? error.message : "unknown error",
//     });
//     return sendError(res, 500, "PART_URL_FAILED", "Failed to create part URL");
//   }
// }

// export async function completeMultipartV2(req: Request, res: Response) {
//   const { token, uploadId, parts } = req.body as CompleteBody;

//   if (
//     typeof token !== "string" || token.length === 0 ||
//     typeof uploadId !== "string" || uploadId.length === 0 ||
//     !Array.isArray(parts) || parts.length === 0
//   ) {
//     return sendError(res, 400, "INVALID_COMPLETE_REQUEST", "Invalid completion request");
//   }

//   const normalizedParts = parts
//     .map((part) => ({
//       PartNumber: Number(part.PartNumber),
//       ETag: typeof part.ETag === "string" ? part.ETag.trim() : "",
//     }))
//     .sort((a, b) => a.PartNumber - b.PartNumber);

//   const invalidPart = normalizedParts.some(
//     (part) => !Number.isInteger(part.PartNumber) || part.PartNumber < 1 || part.PartNumber > 10_000 || part.ETag === "",
//   );
//   const duplicatePart = new Set(normalizedParts.map((part) => part.PartNumber)).size !== normalizedParts.length;

//   if (invalidPart || duplicatePart) {
//     return sendError(res, 400, "INVALID_PART_RECEIPTS", "Invalid or duplicate part receipts");
//   }

//   try {
//     const file = await prisma.file.findUnique({ where: { token } });
//     if (!file || file.isDeleted || file.status !== "UPLOADING" || file.uploadId !== uploadId) {
//       return sendError(res, 404, "SESSION_NOT_FOUND", "Multipart session is not active");
//     }

//     const expectedPartCount = Math.ceil(file.sizeBytes / PART_SIZE_BYTES);
//     if (normalizedParts.length !== expectedPartCount) {
//       return sendError(res, 400, "INCOMPLETE_PARTS", "Not every part has been uploaded");
//     }

//     await completeMultipartUploadV2(file.storedName, uploadId, normalizedParts);
//     await prisma.file.update({
//       where: { id: file.id },
//       data: { status: "READY" },
//     });

//     multipartLog("completion succeeded", { partCount: normalizedParts.length });
//     return res.json({ success: true, message: "Upload complete and file is ready" });
//   } catch (error) {
//     multipartLogError("completion failed", {
//       error: error instanceof Error ? error.message : "unknown error",
//     });
//     return sendError(res, 500, "MULTIPART_COMPLETE_FAILED", "Failed to complete multipart upload");
//   }
// }

// export async function abortMultipartV2(req: Request, res: Response) {
//   const { token, uploadId } = req.body as SessionBody;

//   if (typeof token !== "string" || token.length === 0 || typeof uploadId !== "string" || uploadId.length === 0) {
//     return sendError(res, 400, "INVALID_ABORT_REQUEST", "Invalid abort request");
//   }

//   try {
//     const file = await prisma.file.findUnique({ where: { token } });
//     if (!file || file.uploadId !== uploadId) {
//       return sendError(res, 404, "SESSION_NOT_FOUND", "Multipart session is not active");
//     }

//     if (!file.isDeleted && file.status === "UPLOADING") {
//       await abortMultipartUploadV2(file.storedName, uploadId);
//       await prisma.file.update({
//         where: { id: file.id },
//         data: { isDeleted: true, status: "ABORTED" },
//       });
//     }

//     multipartLog("abort completed", { uploadIdPrefix: uploadId.slice(0, 8) });
//     return res.json({ success: true, message: "Multipart upload aborted" });
//   } catch (error) {
//     multipartLogError("abort failed", {
//       error: error instanceof Error ? error.message : "unknown error",
//     });
//     return sendError(res, 500, "MULTIPART_ABORT_FAILED", "Failed to abort multipart upload");
//   }
// }



import type { Request, Response } from "express";
import { recordSuccessfulUpload } from "../middleware/uploadQuota";
import crypto from "node:crypto";
import prisma from "../lib/prisma";
import {
  abortMultipartUploadV2,
  completeMultipartUploadV2,
  generatePartUploadUrlV2,
  startMultipartUploadV2,
} from "../services/s3Service.v2";

/**
 * Sendly multipart controller V2.
 *
 * This file is a new version. It does not replace upload.controller.ts.
 * It receives small JSON descriptions and coordinates S3. It never receives
 * the large file bytes themselves.
 */

const isDevelopment = process.env.NODE_ENV !== "production";
const multipartLog = (message: string, details?: Record<string, unknown>): void => {
  if (isDevelopment) {
    console.info(`[MULTIPART V2] ${message}`, details ?? "");
  }
};

const multipartLogError = (message: string, details?: Record<string, unknown>): void => {
  if (isDevelopment) {
    console.error(`[MULTIPART V2] ${message}`, details ?? "");
  }
};

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;
const PART_SIZE_BYTES = 16 * 1024 * 1024;
const DEFAULT_EXPIRY_SECONDS = 24 * 60 * 60;
const MAX_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

const ALLOWED_MIMES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml",
  "image/heic", "image/heif", "image/avif", "image/vnd.microsoft.icon",
  "video/mp4", "video/webm", "video/ogg", "video/x-matroska", "video/quicktime",
  "video/x-msvideo", "video/mpeg", "video/3gpp", "video/3gpp2",
  "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac", "audio/webm",
  "audio/midi", "audio/x-m4a", "audio/opus",
  "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.text", "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation", "application/rtf",
  "text/plain", "text/csv", "application/epub+zip",
  "application/zip", "application/x-zip-compressed", "application/x-rar-compressed",
  "application/vnd.rar", "application/x-7z-compressed", "application/gzip", "application/x-gzip",
  "application/x-bzip2", "application/x-tar",
  "font/ttf", "font/otf", "font/woff", "font/woff2",
  "text/html", "text/css", "text/javascript", "application/javascript", "application/json",
  "application/xml", "text/xml", "text/markdown", "application/x-yaml",
];

const BLOCKED_EXTENSIONS = [
  ".exe", ".msi", ".msp", ".mst", ".bat", ".cmd", ".com", ".scr", ".pif",
  ".vbs", ".vbe", ".js", ".jse", ".wsf", ".wsh", ".ps1", ".psm1", ".hta",
  ".cpl", ".lnk", ".reg", ".dll", ".sys", ".drv", ".iso", ".img", ".vhd",
  ".vhdx", ".apk", ".jar", ".sh", ".bash", ".cgi", ".docm", ".xlsm", ".pptm",
];

type StartMultipartBody = {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isEncrypted?: boolean;
  passwordHash?: string | null;
  iv?: string | null;
  salt?: string | null;
  expirySeconds?: number;
  maxDownloads?: number | null;
};

type SessionBody = {
  token: string;
  uploadId: string;
};

type PartUrlBody = SessionBody & {
  partNumber: number;
};

type CompleteBody = SessionBody & {
  parts: Array<{ PartNumber: number; ETag: string }>;
};

function sendError(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({
    success: false,
    error: { code, message },
  });
}

function validateStartBody(body: unknown): string | null {
  const data = body as Partial<StartMultipartBody>;

  if (
    typeof data.originalName !== "string" || data.originalName.trim() === "" ||
    typeof data.mimeType !== "string" || data.mimeType.trim() === "" ||
    typeof data.sizeBytes !== "number" || !Number.isFinite(data.sizeBytes) || data.sizeBytes <= 0
  ) {
    return "Missing or invalid file metadata";
  }

  if (data.sizeBytes < PART_SIZE_BYTES) {
    return "Multipart V2 requires a file of at least 16 MiB";
  }

  if (data.sizeBytes > MAX_FILE_SIZE_BYTES) {
    return "File exceeds the maximum allowed size of 500MB";
  }

  const lowerName = data.originalName.toLowerCase();
  if (BLOCKED_EXTENSIONS.some((extension) => lowerName.endsWith(extension))) {
    return "This file type is blocked for security reasons";
  }

  const allowedMimes = data.isEncrypted
    ? [...ALLOWED_MIMES, "application/octet-stream"]
    : ALLOWED_MIMES;

  if (!allowedMimes.includes(data.mimeType)) {
    return "This file type is not allowed for security reasons";
  }

  if (
    data.expirySeconds !== undefined &&
    (!Number.isInteger(data.expirySeconds) || data.expirySeconds < 60 || data.expirySeconds > MAX_EXPIRY_SECONDS)
  ) {
    return "Invalid expiry period";
  }

  if (
    data.maxDownloads !== undefined && data.maxDownloads !== null &&
    (!Number.isInteger(data.maxDownloads) || data.maxDownloads < 1 || data.maxDownloads > 100)
  ) {
    return "Invalid maximum download count";
  }

  return null;
}

export async function startMultipartV2(req: Request, res: Response) {
  const requestStartedAt = Date.now();
  const body = req.body as StartMultipartBody;
  console.log("BACKED *Multipart >16Mb):Received maxDownlaods=", body.maxDownloads);
  const validationError = validateStartBody(body);
  if (validationError) return sendError(res, 400, "INVALID_INPUT", validationError);

  const token = crypto.randomUUID();
  const storedName = `${crypto.randomUUID()}-${body.originalName}`;
  const expirySeconds = body.expirySeconds ?? DEFAULT_EXPIRY_SECONDS;
  const expiresAt = new Date(Date.now() + expirySeconds * 1000);
  let uploadId: string | null = null;

  try {
    multipartLog("start requested", {
      fileName: body.originalName,
      sizeBytes: body.sizeBytes,
      isEncrypted: Boolean(body.isEncrypted),
    });

    const createdUploadId = await startMultipartUploadV2(storedName, body.mimeType);
    uploadId = createdUploadId;

    multipartLog("S3 session created; creating database row", { elapsedMs: Date.now() - requestStartedAt });
    const file = await prisma.file.create({
      data: {
        token,
        originalName: body.originalName,
        storedName,
        mimeType: body.mimeType,
        sizeBytes: body.sizeBytes,
        isEncrypted: Boolean(body.isEncrypted),
        passwordHash: body.passwordHash || null,
        iv: body.iv || null,
        salt: body.salt || null,
        expiresAt,
        maxDownloads: body.maxDownloads ?? 10,
        status: "UPLOADING",
        uploadId: createdUploadId,
      },
    });

    multipartLog("database row created; start completed", {
      tokenPrefix: token.slice(0, 8),
      uploadIdPrefix: createdUploadId.slice(0, 8),
      elapsedMs: Date.now() - requestStartedAt,
    });

    return res.json({
      success: true,
      data: {
        token: file.token,
        uploadId: createdUploadId,
        shareUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/file/${file.token}`,
      },
    });
  } catch (error) {
    if (uploadId) {
      await abortMultipartUploadV2(storedName, uploadId).catch(() => undefined);
    }

    multipartLogError("start failed", {
      error: error instanceof Error ? error.message : "unknown error",
      elapsedMs: Date.now() - requestStartedAt,
    });
    return sendError(res, 500, "MULTIPART_START_FAILED", "Failed to start multipart upload");
  }
}

export async function getPartUrlV2(req: Request, res: Response) {
  const requestStartedAt = Date.now();
  const { token, uploadId, partNumber } = req.body as PartUrlBody;

  if (
    typeof token !== "string" || token.length === 0 ||
    typeof uploadId !== "string" || uploadId.length === 0 ||
    !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10_000
  ) {
    return sendError(res, 400, "INVALID_PART_REQUEST", "Invalid part request");
  }

  try {
    const file = await prisma.file.findUnique({ where: { token } });
    if (!file || file.isDeleted || file.status !== "UPLOADING" || file.uploadId !== uploadId) {
      return sendError(res, 404, "SESSION_NOT_FOUND", "Multipart session is not active");
    }

    const url = await generatePartUploadUrlV2(file.storedName, uploadId, partNumber);
    multipartLog("part URL created", {
      partNumber,
      host: new URL(url).host,
      uploadIdPrefix: uploadId.slice(0, 8),
      elapsedMs: Date.now() - requestStartedAt,
    });

    return res.json({ success: true, data: { url } });
  } catch (error) {
    multipartLogError("part URL failed", {
      partNumber,
      error: error instanceof Error ? error.message : "unknown error",
      elapsedMs: Date.now() - requestStartedAt,
    });
    return sendError(res, 500, "PART_URL_FAILED", "Failed to create part URL");
  }
}

export async function completeMultipartV2(req: Request, res: Response) {
  const requestStartedAt = Date.now();
  const { token, uploadId, parts } = req.body as CompleteBody;

  if (
    typeof token !== "string" || token.length === 0 ||
    typeof uploadId !== "string" || uploadId.length === 0 ||
    !Array.isArray(parts) || parts.length === 0
  ) {
    return sendError(res, 400, "INVALID_COMPLETE_REQUEST", "Invalid completion request");
  }

  const normalizedParts = parts
    .map((part) => ({
      PartNumber: Number(part.PartNumber),
      ETag: typeof part.ETag === "string" ? part.ETag.trim() : "",
    }))
    .sort((a, b) => a.PartNumber - b.PartNumber);

  const invalidPart = normalizedParts.some(
    (part) => !Number.isInteger(part.PartNumber) || part.PartNumber < 1 || part.PartNumber > 10_000 || part.ETag === "",
  );
  const duplicatePart = new Set(normalizedParts.map((part) => part.PartNumber)).size !== normalizedParts.length;

  if (invalidPart || duplicatePart) {
    return sendError(res, 400, "INVALID_PART_RECEIPTS", "Invalid or duplicate part receipts");
  }

  try {
    const file = await prisma.file.findUnique({ where: { token } });
    if (!file || file.isDeleted || file.status !== "UPLOADING" || file.uploadId !== uploadId) {
      return sendError(res, 404, "SESSION_NOT_FOUND", "Multipart session is not active");
    }

    const expectedPartCount = Math.ceil(file.sizeBytes / PART_SIZE_BYTES);
    if (normalizedParts.length !== expectedPartCount) {
      return sendError(res, 400, "INCOMPLETE_PARTS", "Not every part has been uploaded");
    }

    await completeMultipartUploadV2(file.storedName, uploadId, normalizedParts);
    await prisma.file.update({
      where: { id: file.id },
      data: { status: "READY" },
    });

        // NEW — only count quota here, once S3 + DB both confirm success
    recordSuccessfulUpload((req as any).wristband, file.sizeBytes);

    multipartLog("database status changed to READY; completion succeeded", { partCount: normalizedParts.length, elapsedMs: Date.now() - requestStartedAt });
    return res.json({ success: true, message: "Upload complete and file is ready" });
  } catch (error) {
    multipartLogError("completion failed", {
      error: error instanceof Error ? error.message : "unknown error",
      elapsedMs: Date.now() - requestStartedAt,
    });
    return sendError(res, 500, "MULTIPART_COMPLETE_FAILED", "Failed to complete multipart upload");
  }
}

export async function abortMultipartV2(req: Request, res: Response) {
  const requestStartedAt = Date.now();
  const { token, uploadId } = req.body as SessionBody;

  if (typeof token !== "string" || token.length === 0 || typeof uploadId !== "string" || uploadId.length === 0) {
    return sendError(res, 400, "INVALID_ABORT_REQUEST", "Invalid abort request");
  }

  try {
    const file = await prisma.file.findUnique({ where: { token } });
    if (!file || file.uploadId !== uploadId) {
      return sendError(res, 404, "SESSION_NOT_FOUND", "Multipart session is not active");
    }

    if (!file.isDeleted && file.status === "UPLOADING") {
      await abortMultipartUploadV2(file.storedName, uploadId);
      await prisma.file.update({
        where: { id: file.id },
        data: { isDeleted: true, status: "ABORTED" },
      });
    }

    multipartLog("database status changed to ABORTED; abort completed", { uploadIdPrefix: uploadId.slice(0, 8), elapsedMs: Date.now() - requestStartedAt });
    return res.json({ success: true, message: "Multipart upload aborted" });
  } catch (error) {
    multipartLogError("abort failed", {
      error: error instanceof Error ? error.message : "unknown error",
      elapsedMs: Date.now() - requestStartedAt,
    });
    return sendError(res, 500, "MULTIPART_ABORT_FAILED", "Failed to abort multipart upload");
  }
}
