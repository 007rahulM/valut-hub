import { Router } from "express";
import { createUpload } from "../controllers/upload.controller";
import { enforceUploadQuota } from "../middleware/uploadQuota";
import{startMultipart,getPartUrl,completeMultipart,abortMultipart} from "../controllers/upload.controller";
import rateLimit from "express-rate-limit";



//Why 500: a 5gb upload at 16mb chunks  is approx 320 prts +start +complete +retries
//500 /15min covers tht comfotably but still throttles  bot hrmmering /part
const multipartLimiter=rateLimit({
    windowMs: 15*60*1000,
    max:500,
    standardHeaders:true,
    legacyHeaders:false,
    message:{
        success:false,
        error:{code:"TOO MANY REQUESTS",  message:"Too many multipart requests , please slow down"},
    },
});


const router = Router();

//when the frontend sends a POST request to /api/upload,
//hand it over to teh createUpload controller function 

// standard single put (file<=16 MB)
router.post("/api/upload",enforceUploadQuota, createUpload);


//multiprt :start the session
router.post("/api/upload/multipart/start", multipartLimiter,enforceUploadQuota,startMultipart);

// MultiPart: get presigned url for one chunk
router.post("/api/upload/multipart/part",multipartLimiter,getPartUrl);

// Multipart : Stich chunks and unlock file
router.post("/api/upload/multipart/complete",multipartLimiter, completeMultipart);

// Multipart: Cancel and clean up orphaned chunks
router.post("/api/upload/multipart/abort", multipartLimiter, abortMultipart);


export default router;