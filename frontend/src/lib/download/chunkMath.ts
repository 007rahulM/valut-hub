
// // ============================================================
// // CHUNK MATH — Single source of truth for chunk sizes
// // ============================================================

// const MB = 1024 * 1024;

// export const CHUNK_SIZE = 16 * MB;

// export function getChunkSize(sizeBytes: number): number {
//   if (sizeBytes < 16 * MB) return 0;
//   if (sizeBytes <= 250 * MB) return 16 * MB;
//   if (sizeBytes <= 500 * MB) return 32 * MB;
//   return 50 * MB;
// }

// export function getTotalChunks(fileSize: number): number {
//   if (fileSize === 0) return 0;
//   const size = getChunkSize(fileSize);
//   if (size === 0) return 1;
//   return Math.ceil(fileSize / size);
// }

// export function getChunkRange(
//   chunkIndex: number,
//   fileSize: number
// ): { start: number; end: number } {
//   const size = getChunkSize(fileSize);
//   const start = chunkIndex * size;
//   const end = Math.min(start + size - 1, fileSize - 1);
//   return { start, end };
// }

// export function getChunkIvOffset(chunkIndex: number): number {
//   return chunkIndex;
// }

// ============================================================
// CHUNK MATH — Single source of truth for chunk sizes
// ============================================================

const MB = 1024 * 1024;

export const CHUNK_SIZE = 16 * MB;

export function getChunkSize(sizeBytes: number): number {
  if (sizeBytes < 16 * MB) return 0;
  
  // SDE3 FIX: Always return 16MB for multipart files.
  // WHY: Your V2 upload engine strictly uses 16MB chunks.
  // If download uses 32MB/50MB, the decryption boundaries
  // will mismatch and the file will fail to decrypt.
  return 16 * MB;
}

export function getTotalChunks(fileSize: number): number {
  if (fileSize === 0) return 0;
  const size = getChunkSize(fileSize);
  if (size === 0) return 1;
  return Math.ceil(fileSize / size);
}

export function getChunkRange(
  chunkIndex: number,
  fileSize: number
): { start: number; end: number } {
  const size = getChunkSize(fileSize);
  const start = chunkIndex * size;
  const end = Math.min(start + size - 1, fileSize - 1);
  return { start, end };
}