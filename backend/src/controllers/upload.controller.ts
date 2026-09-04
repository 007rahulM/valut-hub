// import {Request, Response}from "express";
// import crypto from "crypto";
// import prisma from "../lib/prisma";
// import { generateUploadUrl } from "../services/s3Service";
// import { error } from "console";


// /*
// Controller: createUpload

// What it does:
// this function handles the initial step of file upload
// It does not handle the actual file bytes It only handles the metadata


// The Flow:
// 1.Receive file metadata from the frontend (name, type,size, encryption info)
// 2. Validate that required fields are present
// 3. Generate a unique token (for the share link) and a unqiue storedName (for S3)
// 4. Calculate the expiration date
// 5. Save this metadata to our PostgreSQL database via Prisma
// 6. Ask AWS S3 for a temporary "presigned URL"
// 7. Send the token, share link , and presigned URL back to the frontend

// */

// // Only allow safe, common file types
// const ALLOWED_MIMES = [
//   // Images
//   "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml", "image/heic", "image/heif", "image/avif", "image/vnd.microsoft.icon",
//   // Video
//   "video/mp4", "video/webm", "video/ogg", "video/x-matroska", "video/quicktime", "video/x-msvideo", "video/mpeg", "video/3gpp", "video/3gpp2",
//   // Audio
//   "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac", "audio/webm", "audio/midi", "audio/x-m4a", "audio/opus",
//   // Documents
//   "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//   "application/vnd.oasis.opendocument.text", "application/vnd.oasis.opendocument.spreadsheet", "application/vnd.oasis.opendocument.presentation",
//   "application/rtf", "text/plain", "text/csv", "application/epub+zip",
//   // Archives (ZIP, RAR, 7z, etc.)
//   "application/zip", "application/x-zip-compressed", "application/x-rar-compressed", "application/vnd.rar", 
//   "application/x-7z-compressed", "application/gzip", "application/x-gzip", "application/x-bzip2", "application/x-tar",
//   // Fonts
//   "font/ttf", "font/otf", "font/woff", "font/woff2",
//   // Web/Data
//   "text/html", "text/css", "text/javascript", "application/javascript", "application/json", "application/xml", "text/xml", "text/markdown", "application/x-yaml"
// ];

// export async function createUpload(req:Request ,res:Response){
//     try{
//         //step 1: extract metadata from the request body
//         const{originalName , mimeType ,sizeBytes, isEncrypted,passwordHash,iv,salt}=req.body;

//         //step 2: Base Validation
//         if(!originalName || !mimeType || !sizeBytes){
//             return res.status(400).json({
//                 success:false,
//                 error:{code:"INVALID INPUT", message:"Missing required file metadata"},
//             });
//         }

//         //check 2: MIME type validation
//         //if any unknow ytp od .exe or .sh script we will block it here 
//         if(!ALLOWED_MIMES.includes(mimeType)){
//             return res.status(415).json({
//                 success:false,
//                 error:{code:"UNSUPPORTED FILE TYPE", message:`This file type is not allowed for security reasons`}
//             });
//         }

//         //step 3: generate unqiue identifiers
//         //token: used in the URL to share the file eg.. /file/abc-123
//         const token= crypto.randomUUID();

//         //storedName: the actual filename inside the S3 bucket
//         //we prepend a UUID tp prevent collisions if two users upload a file with the same name 
//         const storedName = `${crypto.randomUUID()}-${originalName}`;

//         //step4: calculate expiration
//         //(currentl set to 1 day based on our recent EC2 code changes so  from 7day to 1 day)
//         const expiresAt= new Date(Date.now()+1 * 24 * 60 * 60 * 1000);

//         //Step 5: Save metadata to the database
//         const fileRecord=await prisma.file.create({
//             data:{
//                 token,
//                 originalName,
//                 storedName,
//                 mimeType,
//                 sizeBytes,
//                 isEncrypted:isEncrypted || false,
//                 passwordHash:passwordHash || null ,
//                 iv:iv || null ,
//                 salt:salt || null,
//                 expiresAt,

//             },
//         });


// // step 6: generate the presigned upload url from s3
// //this url allows the browser to upload the file directly to s3  bypassing our server
//       const presignedUrl=await generateUploadUrl(storedName);


//       //step 7: send the response back to the frontend
//       res.json({
//         success:true,
//         data:{
//             token:fileRecord.token,
//             //the link the user will share with their friend 
//             shareUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/file/${fileRecord.token}`,
//             //the temporary url the frontend will use to put the file butes to s3
//             presignedUrl,
//             storedName:fileRecord.storedName,
//         },
//       });
//     }catch(err){
//         console.error(`[Upload Controller] Error:`, err);
//         res.status(500).json({
//             success:false,
//             error:{code:"UPLOD FAILED" ,message:"Failed to process upload"},
//         });
//     }
// }



import {Request, Response}from "express";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { generateUploadUrl , startMultipartUpload, generatePartUploadUrl,completeMultipartUpload,abortMultipartUpload } from "../services/s3Service";
import { error } from "console";
import { json } from "stream/consumers";



/*
Controller: createUpload

What it does:
this function handles the initial step of file upload
It does not handle the actual file bytes It only handles the metadata

The Flow:
1.Receive file metadata from the frontend (name, type,size, encryption info)
2. Validate that required fields are present
2.5 SECURITY: block dangerous extensions + validate MIME type
3. Generate a unique token (for the share link) and a unqiue storedName (for S3)
4. Calculate the expiration date
5. Save this metadata to our PostgreSQL database via Prisma
6. Ask AWS S3 for a temporary "presigned URL"
7. Send the token, share link , and presigned URL back to the frontend

*/

// Only allow safe, common file types
const ALLOWED_MIMES = [
  // Images
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml", "image/heic", "image/heif", "image/avif", "image/vnd.microsoft.icon",
  // Video
  "video/mp4", "video/webm", "video/ogg", "video/x-matroska", "video/quicktime", "video/x-msvideo", "video/mpeg", "video/3gpp", "video/3gpp2",
  // Audio
  "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac", "audio/webm", "audio/midi", "audio/x-m4a", "audio/opus",
  // Documents
  "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.text", "application/vnd.oasis.opendocument.spreadsheet", "application/vnd.oasis.opendocument.presentation",
  "application/rtf", "text/plain", "text/csv", "application/epub+zip",
  // Archives (ZIP, RAR, 7z, etc.)
  "application/zip", "application/x-zip-compressed", "application/x-rar-compressed", "application/vnd.rar",
  "application/x-7z-compressed", "application/gzip", "application/x-gzip", "application/x-bzip2", "application/x-tar",
  // Fonts
  "font/ttf", "font/otf", "font/woff", "font/woff2",
  // Web/Data
  "text/html", "text/css", "text/javascript", "application/javascript", "application/json", "application/xml", "text/xml", "text/markdown", "application/x-yaml"
];

// Dangerous extensions (executables / scripts / macros / disk images).
// Checked by FILENAME, because it works even when the file is encrypted
// (encrypted uploads hide their real MIME type as application/octet-stream).
// SAME list as the frontend FileDropzone — keep them in sync!
const BLOCKED_EXTENSIONS = [
  ".exe", ".msi", ".msp", ".mst", ".bat", ".cmd", ".com", ".scr", ".pif",
  ".vbs", ".vbe", ".js", ".jse", ".wsf", ".wsh", ".ps1", ".psm1", ".hta",
  ".cpl", ".lnk", ".reg", ".dll", ".sys", ".drv", ".iso", ".img", ".vhd",
  ".vhdx", ".apk", ".jar", ".sh", ".bash", ".cgi",
  ".docm", ".xlsm", ".pptm",
];

 const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
export async function createUpload(req:Request ,res:Response){
    try{
        // //step 1: extract metadata from the request body
        // const{originalName , mimeType ,sizeBytes, isEncrypted,passwordHash,iv,salt,expirySeconds,maxDownloads}=req.body;
                //step 1: extract metadata from the request body
        const{originalName , mimeType ,sizeBytes, isEncrypted,passwordHash,iv,salt,expirySeconds,maxDownloads}=req.body;
        console.log("[createUpload] single <16mb maxDownloads received from frontend:", maxDownloads);

        //step 2: Base Validation
        if(!originalName || !mimeType || !sizeBytes){
            return res.status(400).json({
                success:false,
                error:{code:"INVALID_INPUT", message:"Missing required file metadata"},
            });
        }

        // Strict Backend Validation: Never trust the frontend's size limit
       //const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
       if (sizeBytes > MAX_FILE_SIZE_BYTES) {
       return res.status(413).json({
        success: false,
        error: { code: "FILE_TOO_LARGE", message: "File exceeds the maximum allowed size of 500MB." }
    });
}

        //step 2.5a: EXTENSION check (runs for EVERY upload, encrypted or not)
        //a hacker can rename virus.exe -> but the extension still betrays it here
        const lowerName = String(originalName).toLowerCase();
        if(BLOCKED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))){
            return res.status(415).json({
                success:false,
                error:{code:"BLOCKED_FILE_TYPE", message:"This file type is blocked for security reasons. Try zipping it first."},
            });
        }

        //step 2.5b: MIME check.
        //IMPORTANT BUG FIX: when the file is encrypted, the frontend sends
        //"application/octet-stream" (the real type is hidden in the ciphertext).
        //So we allow octet-stream ONLY for encrypted uploads — this is why
        //normal images were being blocked before.
        const allowedMimes = isEncrypted ? [...ALLOWED_MIMES, "application/octet-stream"] : ALLOWED_MIMES;
        if(!allowedMimes.includes(mimeType)){
            return res.status(415).json({
                success:false,
                error:{code:"UNSUPPORTED_FILE_TYPE", message:"This file type is not allowed for security reasons."},
            });
        }

        //calculate expiration using the frontend's value
        const expiresAt=new Date(Date.now()+(expirySeconds || 24*60*60)*1000); 
        

        //step 3: generate unqiue identifiers
        //token: used in the URL to share the file eg.. /file/abc-123
        const token= crypto.randomUUID();

        //storedName: the actual filename inside the S3 bucket
        //we prepend a UUID tp prevent collisions if two users upload a file with the same name
        const storedName = `${crypto.randomUUID()}-${originalName}`;

        //step4: calculate expiration
        //(currentl set to 1 day based on our recent EC2 code changes so  from 7day to 1 day)
        //const= new Date(Date.now()+1 * 24 * 60 * 60 * 1000);

        //Step 5: Save metadata to the database
        const fileRecord=await prisma.file.create({
            data:{
                token,
                originalName,
                storedName,
                mimeType,
                sizeBytes,
                isEncrypted:isEncrypted || false,
                passwordHash:passwordHash || null ,
                iv:iv || null ,
                salt:salt || null ,
                expiresAt,
                maxDownloads: Number(maxDownloads) || 10,
            },
        });


// step 6: generate the presigned upload url from s3
//this url allows the browser to upload the file directly to s3  bypassing our server
      const presignedUrl=await generateUploadUrl(storedName);


      //step 7: send the response back to the frontend
      res.json({
        success:true,
        data:{
            token:fileRecord.token,
            //the link the user will share with their friend
            shareUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/file/${fileRecord.token}`,
            //the temporary url the frontend will use to put the file butes to s3
            presignedUrl,
            storedName:fileRecord.storedName,
        },
      });
    }catch(err){
        console.error(`[Upload Controller] Error:`, err);
        res.status(500).json({
            success:false,
            error:{code:"UPLOAD_FAILED" ,message:"Failed to process upload"},
        });
    }
}


//--------------------------------------------------------------------------------------------
 //for large file than 100 mb we re doing multiprt 

 //Interfaces for multiprt requests----
 // Interfaces define the exact shape of the JSON dat we expect from the frontend
 //this gives us uto-complete nd type sfety in vs code

 interface StartMultipartBody{
    originalName:string;
    mimeType:string;
    sizeBytes:number;
    isEncrypted:boolean;
    passwordHash?:string | null;
    iv?:string | null;
    salt?:string | null;
    expirySeconds?: number;
    maxDownloads?: number | null;
 }

 interface GetPartUrlBody{
    token:string;
    uploadId:string;
    partNumber:number;
 }

 interface CompleteMultipartBody{
    token:string;
    uploadId:string;
    parts:{PartNumber:number; ETag:string}[];
 }

 interface AbortMultipartBody{
    token:string;
    uploadId:string;
 }


 //-----------Multipart upload controller for file > 100 mb)---

 // 1 . start : open the session and create the database placeholder
 export async function startMultipart(req:Request,res:Response){
    try{
        //as StartMultipartBody tells typescript to trsut that the body matches our interface
   const { originalName, mimeType, sizeBytes, isEncrypted, passwordHash, iv, salt, expirySeconds, maxDownloads } = req.body as StartMultipartBody;
   console.log("[DEBUG] startMultipart received maxDownloads:", maxDownloads); // <-- ADD THIS LINE
        if(!originalName || !mimeType || !sizeBytes){
            return res.status(400).json({
                success:false, 
                error:{code:"INVALID INPUT", message:"Missing metadat"}
           });
        }

        //Re-use our existing security checks (Size, Extension, MIME)
       if (sizeBytes > MAX_FILE_SIZE_BYTES) {
            return res.status(413).json({
                success:false, 
                error:{code:"FILE TOO LARGE",message:"File exceeds 500MB"}
            });
        }

        const lowerName=String(originalName).toLowerCase();
        if(BLOCKED_EXTENSIONS.some((ext)=> lowerName.endsWith(ext))){
            return res.status(415).json({
                success:false,
                error:{code:"BLOCKED FILE TYPE" ,message:"Blocked file type"}
            });
        }

        const allowedMimes= isEncrypted ? [...ALLOWED_MIMES, "application/octet-stream"]:ALLOWED_MIMES;
        if(!allowedMimes.includes(mimeType)){
            return res.status(415).json({
                success:false,
                error:{code:"UNSUPPORTED FILE TYPE", message:"MIME type not allowed"}
            });
        }


        const token= crypto.randomUUID();
        const storedName=`${crypto.randomUUID()}-${originalName}`;
        // const expiresAt = new Date(Date.now()+1*24*60*60*1000);  //1 day
                const expiresAt = new Date(Date.now() + (expirySeconds || 24 * 60 * 60) * 1000);
        
        //sk aws to open teh multipart session
        const uploadId=await startMultipartUpload(storedName);

        //save to db as uploading(the gatekeeper)
        const fileRecord=await prisma.file.create({
            data:{
                token,originalName,storedName,mimeType,sizeBytes,
                isEncrypted:isEncrypted || false,
                passwordHash:passwordHash || null,
                iv:iv || null,
                salt:salt || null,
                expiresAt,
                maxDownloads: Number(maxDownloads) || 10,
                status:"UPLOADING",
                uploadId,
            }
        });

        res.json({
            success:true,
            data:{
                token:fileRecord.token,
                uploadId:fileRecord.uploadId,
                shareUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/file/${fileRecord.token}`,
            },
        });

        }catch(err){
            console.error("[startMultipart] Error:",err);
            res.status(500).json({
                success:false,
                error:{code:"SERVER ERROR", message:"Failed to start multipart"}
            });
        }
        
    }


    // 2. part url : hand out a 5-minute VIP pass for one specific chunk 

    export async function getPartUrl(req:Request,res:Response){
        try{
            const{token, uploadId, partNumber}=req.body as GetPartUrlBody;

            //verify the file exisits nd belongs to this sessions
            const file=await prisma.file.findUnique({where:{token}});
            if(!file || file.uploadId !==uploadId){
                return res.status(404).json({
                    success:false,
                    error:{code:"NOT FOUND", message:"Invalid session"}
                });
            }

                const signedUrl=await generatePartUploadUrl(file?.storedName , uploadId, partNumber);
                 res.json({success:true,data:{url:signedUrl}});
            }catch(err){
                console.error("[getPartUrl] Error:",err);
                res.status(500).json({
                    success:false,
                    error:{code:"SERVER ERROR", message:"Failed to get  part URL"}
                });
            }
        }
    





     // 3 Complete: stitch the file and unlock it for downloads
     export async function completeMultipart(req:Request,res:Response){
        try{
            const{token, uploadId ,parts}=req.body as CompleteMultipartBody;

            const file=await prisma.file.findUnique({where:{token}});
            if(!file || file.uploadId !==uploadId){
                return res.status(404).json({
                    success:false,
                    error:{code:"NOT FOUND", message:"Inlvalid session"}
                });
            }

      // AWS requires parts to be sorted by PartNumber before stiching
      parts.sort((a,b)=>a.PartNumber - b.PartNumber);

      //tells aws to stich the chunks into the final object
     await completeMultipartUpload(file.storedName, uploadId, parts);

     //unlock the file: change status to READY
     await prisma.file.update({
        where:{id:file.id},
        data:{status:"READY"},
     });

     res.json({
        success:true,
        message:"Upload complete and file is ready"
     });
    }catch(err){
        console.error("[completeMultipart] Error:", err);
        res.status(500).json({success:false,error:{code:"SERVER_ERROR", message:"Failed to complete uplod"}});
    }
    }


// 4 . Abortt: Cancel and clean up orphaned chunks
export async function abortMultipart(req:Request, res:Response){
    try{
        const{token ,uploadId}=req.body as AbortMultipartBody;

        const file=await prisma.file.findUnique({where:{token}});
        if(file && file.uploadId === uploadId){
            await abortMultipartUpload(file.storedName,uploadId);


            //mark as deleted so the janitor ignores it and users can't see it 
            await prisma.file.update({
                where:{id:file.id},
                data:{isDeleted:true,status:"ABORTED"},
            });
        }
         res.json({
            success:true,
            message:"Upload aborted and cleaned up"
    });
    }catch(err){
        console.error("[abortMultipart] Error:",err);
        res.status(500).json({success:false,error:{code:"SERVER ERROR", mesage:"Failed to abort upload"}});
    }
}

