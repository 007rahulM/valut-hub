


// // //download.controller.ts//
// // import { Request, Response } from "express";
// // import { createHash } from "node:crypto";
// // import prisma from "../lib/prisma";
// // import { generateDownloadUrl } from "../services/s3Service";
// // import {
// //     recordFailedAttempt,
// //     getPenaltyRecord,
// //     MAX_ATTEMPTS,
// // } from "../middleware/enforceDownloadSecurity";

// // /*
// // Controller: processDownload
// // The security checkpoint before anyone gets a file.
// // FIX: penalty identity is now req.ip (stable), so the lockout actually accumulates.
// // */
// // export async function processDownload(req: Request, res: Response) {
// //     try {
// //         const token = req.params.token as string;
// //         const { password } = req.body;

// //         // step 1: look up the file
// //         const file = await prisma.file.findUnique({ where: { token } });

// //         // step 2: safety checks
// //         if (!file || file.isDeleted) {
// //             return res.status(404).json({
// //                 success: false,
// //                 error: { code: "NOT_FOUND", message: "File not found" },
// //             });
// //         }

// //         if (new Date() > file.expiresAt) {
// //             return res.status(410).json({
// //                 success: false,
// //                 error: { code: "EXPIRED", message: "This link has expired" },
// //             });
// //         }

// //         if (file.maxDownloads && file.downloadCount >= file.maxDownloads) {
// //             return res.status(410).json({
// //                 success: false,
// //                 error: { code: "MAX_DOWNLOADS", message: "Download limit reached" },
// //             });
// //         }

// //         // step 3: password check for protected files
// //         if (file.isEncrypted) {
// //             if (!password) {
// //                 return res.status(400).json({
// //                     success: false,
// //                     error: { code: "PASSWORD_REQUIRED", message: "Password required" },
// //                 });
// //             }

// //             const providedHash = createHash("sha256").update(password).digest("hex");

// //             if (providedHash !== file.passwordHash) {
// //                 // FIX: key by IP so attempts accumulate even without a stored cookie
// //                 const userId = req.ip || "unknown";

// //                 recordFailedAttempt(userId);
// //                 const record = getPenaltyRecord(userId);
// //                 const attemptsLeft = Math.max(0, MAX_ATTEMPTS - record.attempts);

// //                 // security camera: log the failed attempt
// //                 await prisma.activityLog.create({
// //                     data: {
// //                         fileId: file.id,
// //                         ipAddress: req.ip || "unknown",
// //                         userAgent: req.headers["user-agent"] || "unknown",
// //                         success: false,
// //                         failureReason: "INVALID_PASSWORD",
// //                     },
// //                 });

// //                 // 5th strike -> locked
// //                 if (record.lockedUntil) {
// //                     return res.status(429).json({
// //                         success: false,
// //                         error: {
// //                             code: "TOO_MANY_ATTEMPTS",
// //                             message: "Too many failed attempts. Locked for 10 minutes.",
// //                             lockedUntil: record.lockedUntil,
// //                             retryAfterSeconds: Math.ceil((record.lockedUntil - Date.now()) / 1000),
// //                             attemptsLeft: 0,
// //                         },
// //                     });
// //                 }

// //                 // not locked yet -> tell frontend how many tries remain
// //                 return res.status(403).json({
// //                     success: false,
// //                     error: {
// //                         code: "INVALID_PASSWORD",
// //                         message: "Incorrect password",
// //                         attemptsLeft,
// //                         maxAttempts: MAX_ATTEMPTS,
// //                     },
// //                 });
// //             }
// //         }

// //         // step 4: all checks passed - temporary S3 download URL (5 min)
// //         const downloadUrl = await generateDownloadUrl(file.storedName, file.originalName);

// //         // step 5: count download + log success
// //         await prisma.file.update({
// //             where: { id: file.id },
// //             data: { downloadCount: { increment: 1 } },
// //         });

// //         await prisma.activityLog.create({
// //             data: {
// //                 fileId: file.id,
// //                 ipAddress: req.ip || null,
// //                 userAgent: req.headers["user-agent"] || null,
// //                 success: true,
// //                 failureReason: null,
// //             },
// //         });

// //         // step 6: send download URL + decryption info
// //         res.json({
// //             success: true,
// //             data: {
// //                 downloadUrl,
// //                 originalName: file.originalName,
// //                 mimeType: file.mimeType,
// //                 isEncrypted: file.isEncrypted,
// //                 iv: file.iv,
// //                 salt: file.salt,
// //                 sizeBytes:file.sizeBytes,
// //             },
// //         });
// //     } catch (err) {
// //         console.error("Download error:", err);
// //         res.status(500).json({
// //             success: false,
// //             error: { code: "SERVER_ERROR", message: "Failed to process download" },
// //         });
// //     }
// // }



// //==============================================
// import { Request, Response } from "express";
// import { createHash } from "node:crypto";
// import prisma from "../lib/prisma";
// import { generateDownloadUrl } from "../services/s3Service";
// import {
//     recordFailedAttempt,
//     getPenaltyRecord,
//     MAX_ATTEMPTS,
// } from "../middleware/enforceDownloadSecurity";

// export async function processDownload(req: Request, res: Response) {
//     try {
//         const token = req.params.token as string;
//         const { password } = req.body;

//         const file = await prisma.file.findUnique({ where: { token } });

//         if (!file || file.isDeleted) {
//             return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "File not found" } });
//         }
//         if (new Date() > file.expiresAt) {
//             return res.status(410).json({ success: false, error: { code: "EXPIRED", message: "This link has expired" } });
//         }
//         if (file.maxDownloads && file.downloadCount >= file.maxDownloads) {
//             return res.status(410).json({ success: false, error: { code: "MAX_DOWNLOADS", message: "Download limit reached" } });
//         }

//         if (file.isEncrypted) {
//             if (!password) {
//                 return res.status(400).json({ success: false, error: { code: "PASSWORD_REQUIRED", message: "Password required" } });
//             }

//             const providedHash = createHash("sha256").update(password).digest("hex");

//             if (providedHash !== file.passwordHash) {
//                 const userId = req.ip || "unknown";
//                 recordFailedAttempt(userId);
//                 const record = getPenaltyRecord(userId);
//                 const attemptsLeft = Math.max(0, MAX_ATTEMPTS - record.attempts);

//                 await prisma.activityLog.create({
//                     data: { fileId: file.id, ipAddress: req.ip || "unknown", userAgent: req.headers["user-agent"] || "unknown", success: false, failureReason: "INVALID_PASSWORD" },
//                 });

//                 if (record.lockedUntil) {
//                     return res.status(429).json({
//                         success: false, error: { code: "TOO_MANY_ATTEMPTS", message: "Too many failed attempts. Locked for 10 minutes.", lockedUntil: record.lockedUntil, retryAfterSeconds: Math.ceil((record.lockedUntil - Date.now()) / 1000), attemptsLeft: 0 },
//                     });
//                 }

//                 return res.status(403).json({
//                     success: false, error: { code: "INVALID_PASSWORD", message: "Incorrect password", attemptsLeft, maxAttempts: MAX_ATTEMPTS },
//                 });
//             }
//         }

//         const downloadUrl = await generateDownloadUrl(file.storedName, file.originalName);

//         // FIX: DO NOT INCREMENT COUNT HERE. Wait for frontend confirmation.
//         await prisma.activityLog.create({
//             data: { fileId: file.id, ipAddress: req.ip || null, userAgent: req.headers["user-agent"] || null, success: true, failureReason: null },
//         });

//         res.json({
//             success: true,
//             data: {
//                 downloadUrl, originalName: file.originalName, mimeType: file.mimeType,
//                 isEncrypted: file.isEncrypted, iv: file.iv, salt: file.salt, sizeBytes: file.sizeBytes,
//             },
//         });
//     } catch (err) {
//         console.error("Download error:", err);
//         res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to process download" } });
//     }
// }

// // FIX: NEW ENDPOINT to increment count ONLY after successful download
// export async function confirmDownload(req: Request, res: Response) {
//     try {
//         const token = req.params.token as string;
//         const file = await prisma.file.findUnique({ where: { token } });
        
//         if (!file) return res.status(404).json({ success: false, error: { code: "NOT_FOUND" } });

//         await prisma.file.update({
//             where: { id: file.id },
//             data: { downloadCount: { increment: 1 } },
//         });

//         res.json({ success: true });
//     } catch (err) {
//         console.error("Confirm download error:", err);
//         res.status(500).json({ success: false, error: { code: "SERVER_ERROR" } });
//     }
// }

//backend/src/controllers/download.controller.ts//

import { Request, Response } from "express";
import { createHash } from "node:crypto";
import prisma from "../lib/prisma";
import { generateDownloadUrl } from "../services/s3Service";
import { recordFailedAttempt, getPenaltyRecord, MAX_ATTEMPTS } from "../middleware/enforceDownloadSecurity";

// export async function processDownload(req: Request, res: Response) {
//     try {
//         const token = req.params.token as string;
//         const { password } = req.body;

//         const file = await prisma.file.findUnique({ where: { token } });

//         if (!file || file.isDeleted) {
//             return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "File not found" } });
//         }
//         if (new Date() > file.expiresAt) {
//             return res.status(410).json({ success: false, error: { code: "EXPIRED", message: "This link has expired" } });
//         }
        
//         // GATE 1: Check limit BEFORE generating URL
//         if (file.maxDownloads !== null && file.downloadCount >= file.maxDownloads) {
//             return res.status(410).json({ success: false, error: { code: "MAX_DOWNLOADS", message: "Download limit reached" } });
//         }

//         if (file.isEncrypted) {
//             if (!password) return res.status(400).json({ success: false, error: { code: "PASSWORD_REQUIRED", message: "Password required" } });

//             const providedHash = createHash("sha256").update(password).digest("hex");
//             if (providedHash !== file.passwordHash) {
//                 const userId = req.ip || "unknown";
//                 recordFailedAttempt(userId);
//                 const record = getPenaltyRecord(userId);
//                 const attemptsLeft = Math.max(0, MAX_ATTEMPTS - record.attempts);

//                 await prisma.activityLog.create({ data: { fileId: file.id, ipAddress: req.ip || "unknown", userAgent: req.headers["user-agent"] || "unknown", success: false, failureReason: "INVALID_PASSWORD" } });

//                 if (record.lockedUntil) {
//                     return res.status(429).json({ success: false, error: { code: "TOO_MANY_ATTEMPTS", message: "Locked for 10 minutes.", lockedUntil: record.lockedUntil, retryAfterSeconds: Math.ceil((record.lockedUntil - Date.now()) / 1000), attemptsLeft: 0 } });
//                 }
//                 return res.status(403).json({ success: false, error: { code: "INVALID_PASSWORD", message: "Incorrect password", attemptsLeft, maxAttempts: MAX_ATTEMPTS } });
//             }
//         }

//         // GATE 2: INCREMENT ATOMICALLY BEFORE HANDING OUT URL
//         // This prevents race conditions (clicking twice quickly) and abandoned downloads.
//         await prisma.file.update({
//             where: { id: file.id },
//             data: { downloadCount: { increment: 1 } },
//         });

//         await prisma.activityLog.create({
//             data: { fileId: file.id, ipAddress: req.ip || null, userAgent: req.headers["user-agent"] || null, success: true, failureReason: null },
//         });

//         const downloadUrl = await generateDownloadUrl(file.storedName, file.originalName);

//         res.json({
//             success: true,
//             data: { downloadUrl, originalName: file.originalName, mimeType: file.mimeType, isEncrypted: file.isEncrypted, iv: file.iv, salt: file.salt, sizeBytes: file.sizeBytes },
//         });
//     } catch (err) {
//         console.error("Download error:", err);
//         res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to process download" } });
//     }
// }

// // Keep this route to prevent 404s, but it does nothing now since we count in processDownload
// export async function confirmDownload(req: Request, res: Response) {
//     res.json({ success: true, message: "Already counted securely" });
// }

export async function processDownload(req: Request, res: Response) {
  try {
    const token = req.params.token as string;
    const { password } = req.body;
    const file = await prisma.file.findUnique({ where: { token } });
    
    if (!file || file.isDeleted) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "File not found" } });
    }
    
    if (new Date() > file.expiresAt) {
      return res.status(410).json({ success: false, error: { code: "EXPIRED", message: "This link has expired" } });
    }
    
    // GATE 1: Check limit BEFORE generating URL
    if (file.maxDownloads !== null && file.downloadCount >= file.maxDownloads) {
      return res.status(410).json({ success: false, error: { code: "MAX_DOWNLOADS", message: "Download limit reached" } });
    }
    
    if (file.isEncrypted) {
      if (!password) return res.status(400).json({ success: false, error: { code: "PASSWORD_REQUIRED", message: "Password required" } });
      
      const providedHash = createHash("sha256").update(password).digest("hex");
      if (providedHash !== file.passwordHash) {
        const userId = req.ip || "unknown";
        recordFailedAttempt(userId);
        const record = getPenaltyRecord(userId);
        const attemptsLeft = Math.max(0, MAX_ATTEMPTS - record.attempts);
        
        await prisma.activityLog.create({ 
          data: { 
            fileId: file.id, 
            ipAddress: req.ip || "unknown", 
            userAgent: req.headers["user-agent"] || "unknown", 
            success: false, 
            failureReason: "INVALID_PASSWORD" 
          } 
        });
        
        if (record.lockedUntil) {
          return res.status(429).json({ 
            success: false, 
            error: { 
              code: "TOO_MANY_ATTEMPTS", 
              message: "Locked for 10 minutes.", 
              lockedUntil: record.lockedUntil, 
              retryAfterSeconds: Math.ceil((record.lockedUntil - Date.now()) / 1000), 
              attemptsLeft: 0 
            } 
          });
        }
        return res.status(403).json({ 
          success: false, 
          error: { 
            code: "INVALID_PASSWORD", 
            message: "Incorrect password", 
            attemptsLeft, 
            maxAttempts: MAX_ATTEMPTS 
          } 
        });
      }
    }
    
    // 🚨 FIX: REMOVED the downloadCount increment from here! 
    // We no longer count when they just ask for the URL.
    
    const downloadUrl = await generateDownloadUrl(file.storedName, file.originalName);
    
    res.json({
      success: true,
      data: { 
        downloadUrl, 
        originalName: file.originalName, 
        mimeType: file.mimeType, 
        isEncrypted: file.isEncrypted, 
        iv: file.iv, 
        salt: file.salt, 
        sizeBytes: file.sizeBytes 
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to process download" } });
  }
}

// 🚨 FIX: THIS IS WHERE THE COUNT ACTUALLY HAPPENS NOW
export async function confirmDownload(req: Request, res: Response) {
  try {
    const token = req.params.token as string;
    const file = await prisma.file.findUnique({ where: { token } });
    
    if (!file || file.isDeleted) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "File not found" } });
    }

    // INCREMENT ATOMICALLY ONLY WHEN FRONTEND CONFIRMS 100% COMPLETION
    await prisma.file.update({
      where: { id: file.id },
      data: { downloadCount: { increment: 1 } },
    });

    // Log the successful activity
    await prisma.activityLog.create({
      data: { 
        fileId: file.id, 
        ipAddress: req.ip || null, 
        userAgent: req.headers["user-agent"] || null, 
        success: true, 
        failureReason: null 
      },
    });

    res.json({ success: true, message: "Download count incremented" });
  } catch (err) {
    console.error("Confirm download error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to confirm download" } });
  }
}