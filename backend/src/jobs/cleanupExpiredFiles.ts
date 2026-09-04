// import cron from 'node-cron';
// import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
// import prisma from '../lib/prisma';
// import fs from 'fs';
// import path from 'path';

// // S3 Client Setup
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY!,
//     secretAccessKey: process.env.AWS_SECRET_KEY!,
//   },
// });

// const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
// const LOG_FILE = path.join(__dirname, '../../cleanup-errors.log');

// // Helper: Log errors to a file
// function logError(message: string) {
//   const timestamp = new Date().toISOString();
//   fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
//   console.error(`[CLEANUP ERROR] ${message}`);
// }

// // Main Cleanup Function
// export async function runCleanupJob() {
//   console.log('[CLEANUP] 🚀 Starting daily cleanup job...');
//   let hasMore = true;

//   try {
//     while (hasMore) {
//       // Fetch in batches of 100 to prevent RAM spikes on low-memory servers
//       const expiredFiles = await prisma.file.findMany({
//         where: {
//           expiresAt: { lt: new Date() },
//           isDeleted: false,
//         },
//         take: 100,
//         select: { id: true, storedName: true, originalName: true },
//       });

//       if (expiredFiles.length === 0) {
//         hasMore = false;
//         console.log('[CLEANUP] ✅ No more expired files. Job finished.');
//         break;
//       }

//       console.log(`[CLEANUP] 📦 Processing batch of ${expiredFiles.length} files...`);

//       for (const file of expiredFiles) {
//         // 🛡️ SAFETY CHECK: Skip if storedName is missing to prevent AWS bucket deletion errors
//         if (!file.storedName) {
//           console.warn(`[CLEANUP] ⚠️ Skipping row ${file.id} with missing storedName`);
//           // Mark it as deleted in DB so we don't keep trying to process this bad row
//           await prisma.file.update({
//             where: { id: file.id },
//             data: { isDeleted: true },
//           });
//           continue; 
//         }

//         try {
//           // Step A: Delete from S3 first (prevents orphaned files if DB update fails)
//           await s3Client.send(
//             new DeleteObjectCommand({
//               Bucket: BUCKET_NAME,
//               Key: file.storedName, // Now guaranteed to be a valid string
//             })
//           );

//           // Step B: Mark as deleted in DB
//           await prisma.file.update({
//             where: { id: file.id },
//             data: { isDeleted: true },
//           });

//           console.log(`[CLEANUP] ✅ Deleted: ${file.originalName}`);
//         } catch (error: any) {
//           // We do NOT mark as deleted in DB if S3 fails, so it safely retries next time
//           const errorMsg = `Failed to delete ${file.originalName} (${file.storedName}): ${error.message}`;
//           logError(errorMsg);
//         }
//       }
//     }
//     console.log('[CLEANUP] 🎉 Daily cleanup job completed successfully.');
//   } catch (error: any) {
//     console.error('[CLEANUP] 💥 Critical job failure:', error.message);
//   }
// }

// // // Schedule: 30 19 * * * means 19:30 UTC, which is exactly 1:30 AM IST
// // // (Change to '0 2 * * *' for 2:00 AM IST)
// // cron.schedule('30 19 * * *', async () => {
// //   console.log('[CRON] ⏰ Triggering cleanup job...');
// //   await runCleanupJob();
// // });

// console.log('[CLEANUP] Cron job scheduled.');



import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import prisma from '../lib/prisma';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export async function runCleanupJob() {
  console.log('[CLEANUP] 🚀 Starting cleanup job...');
  let totalDeleted = 0;
  let totalFailed = 0;
  let hasMore = true;

  // THE SAFETY LOCK & BATCHING (Protects your 1GB RAM)
  while (hasMore) {
    const expiredFiles = await prisma.file.findMany({
      where: {
        expiresAt: { lt: new Date() },
        isDeleted: false,
      },
      take: 100, // Batch size
      select: { id: true, storedName: true, originalName: true },
    });

    if (expiredFiles.length === 0) {
      hasMore = false;
      break;
    }

    for (const file of expiredFiles) {
      // Safety check for corrupted rows
      if (!file.storedName) {
        await prisma.file.update({ where: { id: file.id }, data: { isDeleted: true } });
        continue;
      }

      try {
        // 1. Delete from S3
        await s3Client.send(new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: file.storedName,
        }));
        
        // 2. Mark as deleted in DB
        await prisma.file.update({
          where: { id: file.id },
          data: { isDeleted: true },
        });
        totalDeleted++;
      } catch (error: any) {
        totalFailed++;
        console.error(`[CLEANUP ERROR] Failed: ${file.storedName} - ${error.message}`);
      }
    }
  }

  console.log(`[CLEANUP] 🎉 Finished. Deleted: ${totalDeleted}, Failed: ${totalFailed}`);
}

// 🚨 THE GITHUB ACTIONS TRIGGER:
// This block only runs if you execute this file directly (e.g., via ts-node in GitHub Actions)
if (require.main === module) {
  runCleanupJob()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}