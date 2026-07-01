import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./lib/prisma";
import { timeStamp } from "node:console";

//Load the environment variables from .env file 
dotenv.config();

const app=express();

//middlewares: dunctions that run before the actual request handler 
app.use(cors());     //allows us to make requests frontend to talk to backend
app.use(express.json());   //parse JSON request bodies

//health check endpoint
app.get("/health",(req,res)=>{
    res.json({status:"ok" ,timeStamp: new Date().toISOString()});
});

//get /api/file/:token - first endpoint 
//

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





//start server 

const PORT=process.env.PORT || 3001;
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});