import{Request,Response} from "express"; //importing request and responce explicityly
import prisma from "../lib/prisma"; 
import { getPenaltyRecord } from "../middleware/enforceDownloadSecurity";


//get/api/file/:token - returns metadata so the share page can show file info

export async function getFileMetadata(req:Request,res:Response){
    try{
        const token  = req.params.token as string;
 const file = await prisma.file.findUnique({ where: { token } });

        if(!file){
            return res.status(404).json({
                success:false,
                error:{code:"NOT_FOUND", message: "File not found"},
            });
        }

        if(file.isDeleted){
            return res.status(404).json({
                success:false,
                error:{code: "NOT_FOUND", message:"File has been deleted"},
            });
        }

        // if(new Date() > file.expiresAt){
        //     return res.status(410).json({
        //         success:false,
        //         error:{code:"EXPIRED", message: "This link has expired"},

        //     });
        // }
                if(new Date() > file.expiresAt){
            return res.status(410).json({
                success:false,
                error:{code:"EXPIRED", message: "This link has expired"},
            });
        }

        // LOGICAL EXPIRATION: Stop serving if download limit is reached
        if (file.maxDownloads !== null && file.downloadCount >= file.maxDownloads) {
            return res.status(410).json({
                success: false,
                error: { code: "MAX_DOWNLOADS_REACHED", message: "This link has reached its download limit" },
            });
        }
        // Tell the frontend if THIS visitor is currently locked,
// so every open tab shows the same lock on page load
const visitorId = (req as any).wristband || req.ip || "unknown";
const penalty = getPenaltyRecord(visitorId);
const nowTs = Date.now();
const lockRemainingSeconds = penalty.lockedUntil && penalty.lockedUntil > nowTs
    ? Math.ceil((penalty.lockedUntil - nowTs) / 1000)
    : 0;

        return res.json({
            success:true,
            data:{
                originalName:file.originalName,
                mimeType:file.mimeType,
                sizeBytes:file.sizeBytes,
                isEncrypted:file.isEncrypted,
                expiresAt:file.expiresAt,
                downloadCount:file.downloadCount,
                maxDownloads:file.maxDownloads,
                createdAt:file.createdAt,
                lockRemainingSeconds,
            },
        });
    }catch(err){
        console.error("Error fetching file:",err);
        return res.status(500).json({
            success:false,
            error:{code:"SERVER_ERROR", message:"Failed to fetch file"},
        });
    }
}