import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./lib/prisma";
import { error, timeStamp } from "node:console";

import { generateDownloadUrl } from "./services/s3Service";




//Load the environment variables from .env file 
dotenv.config();

const app=express();

//use the upload route for handling file uploads


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
        //get toek from url and password from request body
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


             // has the provided password and compare 
             const encoder = new TextEncoder();
             const data = encoder .encode(password);
             const hashBuffer = await crypto.subtle.digest("SHA-256",data);
             const hashArray= Array.from(new Uint8Array(hashBuffer));
             const providedHash = hashArray.map(b=> b.toString(16).padStart(2, "0")).join("");

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