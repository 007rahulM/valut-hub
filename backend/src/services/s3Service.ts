// // S3 service  for handling file uploads and downloads 

// //import aws sdk 
// //S3Client = connection to AWS S3 service

// //PutObjectCommand = to upload a file or object to S3 bucket
// //GetObjectCommand = to get a file or obejct from S3 bucket

// import{S3Client, PutObjectCommand, GetObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand}from "@aws-sdk/client-s3";

// //getSingedUrl = it creates temorary preigned urls 
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// // console.log("[s3Service] INIT: creating S3 client");

// //creating a S3 client to make connection to AWS account 

// const s3Client = new  S3Client({
//     //aws region 
//     region:process.env.AWS_REGION!,  //here the ! tells teh typescript that "these exist, trust me like that "


//     //IAM user credentials
// credentials: {
//     accessKeyId:process.env.AWS_ACCESS_KEY!,
//    secretAccessKey:process.env.AWS_SECRET_KEY!,

//   },
// });


// //bucket name from .env
// const BUCKET_NAME=process.env.AWS_S3_BUCKET_NAME!;


// //  Generate Upload URL - it creates a temporary url to upload a file to s3
// export async function generateUploadUrl(storedName: string): Promise<string> { 
// // console.log(`[generateUploadUrl] STEP 1: called`, { storedName, bucket: BUCKET_NAME });
//   // Tell S3 we want to upload (PUT) a file
//   const command = new PutObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: storedName,  // The unique filename in S3
//     // No ACL needed - bucket policy controls access
//   });
//   //  console.log(` [generateUploadUrl] STEP 2: PutObjectCommand created`);

//   // Generate presigned URL valid for 5 minutes
//   try{
//     // console.log(` [generateUploadUrl] STEP 3: getSignedUrl start`);
//   const signedUrl = await getSignedUrl(s3Client, command, {
//     expiresIn: 300,  // 300 seconds = 5 minutes
//   });
//   // console.log(` [generateUploadUrl] STEP 3 DONE: getSignedUrl success`, { signedUrl });

//   return signedUrl;
// }catch(err){
//   throw err;

// }finally{
//   // console.log(` [generateUploadUrl] STEP END: finished`);
// }
// }


// //  Generate Dowload URL - it creates a temporary url to download a file fro s3

// export async function generateDownloadUrl(storedName: string) : Promise <string>{
  
//   //console.log("[generateDownloadUrl] STEP 1: called", { storedName, bucket: BUCKET_NAME });
//   //tell s3 i want to download this file from this bucket
//   const command = new GetObjectCommand({
//     Bucket:BUCKET_NAME, //our bucket name 
//     Key:storedName,  //this file name in the s3 bucket
//   });
//   //console.log("[generateDownloadUrl] STEP 2: GetObjectCommand created");

//   //generate presigned url valid for 5 min 
//   try{
//     // console.log(`[generateDownloadUrl] STEP 3: getSignedUrl start`);
//     const signedUrl= await getSignedUrl(s3Client,command,{
//       expiresIn:300, //300 seconds = 5 min 

//     });

//     // console.log(`[generateDownloadUrl] STEP 3 DONE: getSignedUrl success`, { signedUrl });
//     return signedUrl; 
//    }catch(err){
//     console.error(`[generateDownloadUrl]  ERROR: getSignedUrl failed`, err);
//     throw err;
//    }
//    finally{
//     // console.log(`[generateDownloadUrl] STEP END: finished`);
//    }
// }



// //Multipart upload commands 
// //same patterns as PutObjectCommand above: build a commnd object,
// //then send it (or sign it into a presigned URL for the browser)

// //1. OPEN the session
// //tells s3  a chunked upload is coming for this key
// //returns the uploadId (the session token all chunks must carry)

// export async function startMultipartUpload(storedName:string):Promise<string>{
//   const command= new CreateMultipartUploadCommand({
//     Bucket:BUCKET_NAME,
//     Key:storedName,
//   });
//   const result = await s3Client.send(command);
//   return result.UploadId!;   //always present on sucess
// }

// //2. Sign one chunks upload URL
// //We do Not upload the bytes here  we sign an UploadPartCommand so the 
// //browser can Put this one chunk straight to s3(5-minute validatiy , issued just-in-time right before the chunk is sent)

// export async function generatePartUploadUrl(
//   storedName:string,
//   uploadId:string,
//   partNumber:number   //AWS part numbers start at 1, not 0 
// ):Promise<string>{
//   const command= new UploadPartCommand({
//     Bucket:BUCKET_NAME,
//     Key:storedName,
//     UploadId:uploadId,
//     PartNumber:partNumber,
//   });
//   return getSignedUrl(s3Client,command,{expiresIn:300});
// }


// // 3. Stich the object together  in the s3
// //called once after teh last chunk landed parts = the receipts:
// //[{PartNumber:1, Etag:"..."}, ...] - must be sorted by PartNumber

// export async function completeMultipartUpload(
//   storedName:string,
//   uploadId:string,
//   parts:{PartNumber:number; ETag:string}[]
// ):Promise<void>{
//   const commnd = new CompleteMultipartUploadCommand({
//     Bucket: BUCKET_NAME,
//     Key:storedName,
//     UploadId:uploadId,
//     MultipartUpload:{Parts:parts},
//   });
//   await s3Client.send(commnd);
// }


// // 4 cancel and clean up 
// //deletes all uploaded parts of an abandoned/cancelled session so we 
// //never py for orphaned storage Used by the cancel button and the cron job will come nd delte it on that day 

// export async function abortMultipartUpload(
//   storedName:string,
//   uploadId:string,
// ):Promise<void>{
//   const command= new AbortMultipartUploadCommand({
//     Bucket:BUCKET_NAME,
//     Key:storedName,
//     UploadId:uploadId,
//   });

//   await s3Client.send(command);
// }





// S3 service for Sendly uploads and downloads.
// The multipart part URL explicitly signs the same content type that the
// browser sends in uploadChunkWithProgress(). The single-PUT path is unchanged.

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
    GetObjectCommandInput
  
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const MULTIPART_CONTENT_TYPE = "application/octet-stream";

export async function generateUploadUrl(storedName: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: storedName,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 300 });
}

// export async function generateDownloadUrl(storedName: string): Promise<string> {
//   const command = new GetObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: storedName,
//   });

//   return getSignedUrl(s3Client, command, { expiresIn: 300 });
// }


// Update the generateDownloadUrl function:

export async function generateDownloadUrl(
  storedName: string,
  originalFileName?: string  // ← ADD THIS PARAMETER
): Promise<string> {
  console.log("[generateDownloadUrl] STEP 1: called", { storedName, bucket: BUCKET_NAME });

  const commandParams: GetObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: storedName,
  };

  // If original filename provided, set Content-Disposition
  // WHY: Pattern B (native browser download) needs this to save with correct filename
  if (originalFileName) {
    // RFC 6266 encoding for unicode filenames
    const encoded = encodeURIComponent(originalFileName)
      .replace(/['()]/g, escape)
      .replace(/\*/g, "%2A");
    commandParams.ResponseContentDisposition = `attachment; filename="${encoded}"`;
  }

  const command = new GetObjectCommand(commandParams);
  console.log("[generateDownloadUrl] STEP 2: GetObjectCommand created");

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
      // expiresIn:3600, //1 hour
    });
    console.log("[generateDownloadUrl] STEP 3 DONE: getSignedUrl success");
    return signedUrl;
  } catch (err) {
    console.error("[generateDownloadUrl] ERROR: getSignedUrl failed", err);
    throw err;
  }
}

export async function startMultipartUpload(storedName: string): Promise<string> {
  const command = new CreateMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: storedName,
    ContentType: MULTIPART_CONTENT_TYPE,
  });

  const result = await s3Client.send(command);
  if (!result.UploadId) {
    throw new Error("S3 did not return a multipart upload ID");
  }
  return result.UploadId;
}

export async function generatePartUploadUrl(
  storedName: string,
  uploadId: string,
  partNumber: number,
): Promise<string> {
  const command = new UploadPartCommand({
    Bucket: BUCKET_NAME,
    Key: storedName,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 300 });
}

export async function completeMultipartUpload(
  storedName: string,
  uploadId: string,
  parts: { PartNumber: number; ETag: string }[],
): Promise<void> {
  const command = new CompleteMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: storedName,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts
        .slice()
        .sort((a, b) => a.PartNumber - b.PartNumber),
    },
  });

  await s3Client.send(command);
}

export async function abortMultipartUpload(
  storedName: string,
  uploadId: string,
): Promise<void> {
  const command = new AbortMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: storedName,
    UploadId: uploadId,
  });

  await s3Client.send(command);
}



