import dotenv from "dotenv";
//Load the environment variables from .env file 
dotenv.config();

import express from "express";
import cors from "cors";
import prisma from "./lib/prisma";
import { error, timeStamp } from "node:console";
import crypto from "crypto";  //for generating unique identifiers and hashing passwords
import {createHash} from "crypto";   //has the provided password using node.js crypto not the borowser crypto because this is backend code and we are using node.js runtime
import { generateUploadUrl, generateDownloadUrl } from "./services/s3Service";


const app=express();

app.use(cors());     //allows us to make requests frontend to talk to backend
app.use(express.json());   //parse JSON request bodies


//use the upload route for handling file uploads
// POST /api/upload - Create a new upload record and get a presigned URL
app.post("/api/upload", async (req, res) => {
    // console.log(`[POST /api/upload] STEP 1: route hit`);
//   console.log(`[POST /api/upload] STEP 2: req.body`, req.body);
  try {
    // 1. Get metadata from the frontend request
    const { originalName, mimeType, sizeBytes, isEncrypted, passwordHash, iv, salt } = req.body;
    //  console.log(` [POST /api/upload] STEP 3: extracted fields`, {
    //   originalName, mimeType, sizeBytes, isEncrypted,
    //   hasPasswordHash: !!passwordHash, hasIv: !!iv, hasSalt: !!salt
    // });

    // Basic validation
    if (!originalName || !mimeType || !sizeBytes) {
        // console.log(`[ [POST /api/upload] STEP 3.1: validation failed`);
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Missing required file metadata" },
      });
    }

    // 2. Generate unique identifiers
    const token = crypto.randomUUID(); 
    // Stored name is the actual filename in S3 (prevents collisions)
    const storedName = `${crypto.randomUUID()}-${originalName}`; 
    //  console.log(`[POST /api/upload] STEP 4: generated token/storedName`, { token, storedName });

    // 3. Calculate expiration (7 days from now)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//  console.log(`[ [POST /api/upload] STEP 5: expiresAt`, expiresAt.toISOString());
    // 4. Save metadata to the database using Prisma
    //  console.log(`[POST /api/upload] STEP 6: prisma.file.create start`);
    const fileRecord = await prisma.file.create({
      data: {
        token,
        originalName,
        storedName,
        mimeType,
        sizeBytes,
        isEncrypted: isEncrypted || false,
        passwordHash: passwordHash || null,
        iv: iv || null,
        salt: salt || null,
        expiresAt,
      },
    });
//  console.log(`[ [POST /api/upload] STEP 6 DONE: prisma.file.create success`, { fileId: fileRecord.id, token: fileRecord.token });

    // 5. Generate the Presigned Upload URL from S3
    // console.log(` [POST /api/upload] STEP 7: generateUploadUrl start`, { storedName });
    const presignedUrl = await generateUploadUrl(storedName);
//  console.log(`[ [POST /api/upload] STEP 7 DONE: generateUploadUrl success`);
    // 6. Send the response back to the frontend
        // console.log(` [POST /api/upload] STEP 8: sending success response`);
    res.json({
      success: true,
      data: {
        token: fileRecord.token,
        shareUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/file/${fileRecord.token}`,
        presignedUrl,
        storedName: fileRecord.storedName,
      },
    });

  } catch (error) {
    // console.error(` [POST /api/upload] STEP ERROR: Upload error`, error);
    res.status(500).json({
      success: false,
      error: { code: "UPLOAD_FAILED", message: "Failed to process upload" },
    });
  }
  finally{
    // console.log(` [POST /api/upload] END`);
  }
});


//middlewares: dunctions that run before the actual request handler 
app.use(cors());     //allows us to make requests frontend to talk to backend
app.use(express.json());   //parse JSON request bodies

//health check endpoint
app.get("/health",(req,res)=>{
    res.json({status:"ok" ,timeStamp: new Date().toISOString()});
});

//////////////////////////////////////////////

//get /api/file/:token - first endpoint 

app.get("/api/file/:token",async(req,res)=>{
    try{
        const{token}=req.params;

        //look up file in database
        const file=await  prisma.file.findUnique({
            where:{token},
        });

        //file not found
        if(!file){
            return res.status(404).json({
                success:false,
                error:{code: "NOT_FOUND", message: "File not found"}
            });
        }

        //file was deleted
        if(file.isDeleted){
            return res.status(404).json({
                success:false,
                error:{code:"NOT_FOUND",message:"File has been deleted"}
            });
        }


        //file expired
        if(new Date() > file.expiresAt){
            return res.status(410).json({
                success:false,
                error:{code:"EXPIRED", message: "This link has expired"}
            });
        }


        //success then return file metadata
        res.json({
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
            }
        });

    }catch(err){
  console.error("Error fetching file:",err);
  res.status(500).json({
    success:false,
    error:{code:"SERVER_ERROR",message:"Failed to fetch file"}
  });
    }
});


// If using Express
app.get('/', (req, res) => {
  res.send('VaultHub Backend API is running smoothly!');
});

///////////////////////////////////////////////////

//         POST: /api/dowload/:token    //

app.post("/api/download/:token",async(req,res)=>{
    try{
        //get token from url and password from request body
        const{token}=req.params;
        const{password}=req.body;

        //look for  file in database
        const file = await prisma.file.findUnique({
            where:{token},
        }) ;

        //checking if files exists and is not deleted
        if(!file || file.isDeleted){
            return res.status(404).json({
                success:false,
                error:{code:"NOT_FOUND ", message:" File not found "},
            });   
        }

        // checking if link expired
        if(new Date() > file.expiresAt){
            return res.status(410).json({
                success:false,
                error:{code: "EXPIRED" , message: "This link has expired"},
            });
        }


        //checking dowload limit
        if(file.maxDownloads && file.downloadCount >=
            file.maxDownloads){
                return res.status(410).json({
                    success:false,
                    error:{code:"MAX DOWLOADS", message:"Dowload limit reached"},
                });
            }

        // if its encrypted then verify password
        if(file.isEncrypted){
            //no password provided?
            if(!password){
                return res.status(400).json({
                    success:false,
                    error:{code:"PASSWORD REQUIRED", message:"Password required"},

                });
            }


            ////  has the provided password and compare 
            //  const encoder = new TextEncoder();
            //  const data = encoder .encode(password);
            //  const hashBuffer = await crypto.subtle.digest("SHA-256",data);
            //  const hashArray= Array.from(new Uint8Array(hashBuffer));
            //  const providedHash = hashArray.map(b=> b.toString(16).padStart(2, "0")).join("");
    const providedHash = createHash("sha256").update(password).digest("hex");


             if(providedHash !==file.passwordHash){
                return res.status(403).json({
                    success:false,
                    error:{code:"INVALID PASSWORD", message:"Incorrect password"},

                });
             }
        }

         // now generate presigned S3 download url 
         const downloadUrl =await generateDownloadUrl(file.storedName);

         //increment download count
         await prisma.file.update({
            where:{id:file.id},
            data:{downloadCount:{increment:1}},
         });

         // log the download attempt
         await prisma.activityLog.create({
            data:{
                fileId: file.id,
                ipAddress: req.ip || null,
                userAgent: req.headers["user-agent"] || null,
                success:true,
                failureReason:null,
            },
         });
        
         // if everything is fine the return the dowload url and encryption params 
         res.json({
            success:true,
            data:{
                downloadUrl,
                originalName:file.originalName,
                mimeType:file.mimeType,
                isEncrypted:file.isEncrypted,
                iv:file.iv,
                salt:file.salt,
            },
         });

    }catch(err){
        console.error("Download error:", err);
        res.status(500).json({
            success:false,
            error:{code:"SERVER ERROR", message:"Failed to process download"},
        });
    }
        
    });





//start server 

const PORT=process.env.PORT || 3001;
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});