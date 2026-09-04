// import {
//   AbortMultipartUploadCommand,
//   CompleteMultipartUploadCommand,
//   CreateMultipartUploadCommand,
//   S3Client,
//   UploadPartCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// /**
//  * Sendly multipart S3 service V2.
//  *
//  * This file is deliberately separate from the old s3Service.ts. It contains
//  * only the AWS work needed by upload.controller.v2.ts.
//  */

// const isDevelopment = process.env.NODE_ENV !== "production";
// const log = (message: string, details?: Record<string, unknown>): void => {
//   if (isDevelopment) {
//     console.info(`[S3 MULTIPART V2] ${message}`, details ?? "");
//   }
// };

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY!,
//     secretAccessKey: process.env.AWS_SECRET_KEY!,
//   },
// });

// const bucketName = process.env.AWS_S3_BUCKET_NAME!;
// const PART_URL_EXPIRY_SECONDS = 10 * 60;

// export async function startMultipartUploadV2(
//   storedName: string,
//   mimeType: string,
// ): Promise<string> {
//   const command = new CreateMultipartUploadCommand({
//     Bucket: bucketName,
//     Key: storedName,
//     ContentType: mimeType,
//   });

//   const result = await s3Client.send(command);
//   if (!result.UploadId) {
//     throw new Error("S3 did not return an UploadId");
//   }

//   log("multipart session opened", {
//     uploadIdPrefix: result.UploadId.slice(0, 8),
//   });

//   return result.UploadId;
// }

// export async function generatePartUploadUrlV2(
//   storedName: string,
//   uploadId: string,
//   partNumber: number,
// ): Promise<string> {
//   if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10_000) {
//     throw new Error("Invalid multipart part number");
//   }

//   // Important: do not add ContentType to UploadPartCommand. The AWS SDK
//   // version used by this project does not accept that property here.
//   const command = new UploadPartCommand({
//     Bucket: bucketName,
//     Key: storedName,
//     UploadId: uploadId,
//     PartNumber: partNumber,
//   });

//   const url = await getSignedUrl(s3Client, command, {
//     expiresIn: PART_URL_EXPIRY_SECONDS,
//   });

//   log("part URL signed", {
//     partNumber,
//     host: new URL(url).host,
//     expiresInSeconds: PART_URL_EXPIRY_SECONDS,
//   });

//   return url;
// }

// export async function completeMultipartUploadV2(
//   storedName: string,
//   uploadId: string,
//   parts: Array<{ PartNumber: number; ETag: string }>,
// ): Promise<void> {
//   const sortedParts = parts
//     .slice()
//     .sort((a, b) => a.PartNumber - b.PartNumber);

//   await s3Client.send(new CompleteMultipartUploadCommand({
//     Bucket: bucketName,
//     Key: storedName,
//     UploadId: uploadId,
//     MultipartUpload: {
//       Parts: sortedParts,
//     },
//   }));

//   log("multipart session completed", {
//     partCount: sortedParts.length,
//   });
// }

// export async function abortMultipartUploadV2(
//   storedName: string,
//   uploadId: string,
// ): Promise<void> {
//   await s3Client.send(new AbortMultipartUploadCommand({
//     Bucket: bucketName,
//     Key: storedName,
//     UploadId: uploadId,
//   }));

//   log("multipart session aborted");
// }


import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Sendly multipart S3 service V2.
 *
 * This file is deliberately separate from the old s3Service.ts. It contains
 * only the AWS work needed by upload.controller.v2.ts.
 */

const isDevelopment = process.env.NODE_ENV !== "production";
const log = (message: string, details?: Record<string, unknown>): void => {
  if (isDevelopment) {
    console.info(`[S3 MULTIPART V2] ${message}`, details ?? "");
  }
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME!;
const PART_URL_EXPIRY_SECONDS = 10 * 60;

export async function startMultipartUploadV2(
  storedName: string,
  mimeType: string,
): Promise<string> {
  const command = new CreateMultipartUploadCommand({
    Bucket: bucketName,
    Key: storedName,
    ContentType: mimeType,
  });

  const result = await s3Client.send(command);
  if (!result.UploadId) {
    throw new Error("S3 did not return an UploadId");
  }

  log("multipart session opened", {
    uploadIdPrefix: result.UploadId.slice(0, 8),
  });

  return result.UploadId;
}

export async function generatePartUploadUrlV2(
  storedName: string,
  uploadId: string,
  partNumber: number,
): Promise<string> {
  if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10_000) {
    throw new Error("Invalid multipart part number");
  }

  // Important: do not add ContentType to UploadPartCommand. The AWS SDK
  // version used by this project does not accept that property here.
  const command = new UploadPartCommand({
    Bucket: bucketName,
    Key: storedName,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: PART_URL_EXPIRY_SECONDS,
  });

  log("part URL signed", {
    partNumber,
    host: new URL(url).host,
    expiresInSeconds: PART_URL_EXPIRY_SECONDS,
  });

  return url;
}

export async function completeMultipartUploadV2(
  storedName: string,
  uploadId: string,
  parts: Array<{ PartNumber: number; ETag: string }>,
): Promise<void> {
  const sortedParts = parts
    .slice()
    .sort((a, b) => a.PartNumber - b.PartNumber);

  await s3Client.send(new CompleteMultipartUploadCommand({
    Bucket: bucketName,
    Key: storedName,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: sortedParts,
    },
  }));

  log("multipart session completed", {
    partCount: sortedParts.length,
  });
}

export async function abortMultipartUploadV2(
  storedName: string,
  uploadId: string,
): Promise<void> {
  await s3Client.send(new AbortMultipartUploadCommand({
    Bucket: bucketName,
    Key: storedName,
    UploadId: uploadId,
  }));

  log("multipart session aborted");
}
