// S3 service  for handling file uploads and downloads 

//import aws sdk 
//S3Client = connection to AWS S3 service

//PutObjectCommand = to upload a file or object to S3 bucket
//GetObjectCommand = to get a file or obejct from S3 bucket

import{S3Client, PutObjectCommand, GetObjectCommand}from "@aws-sdk/client-s3";

//getSingedUrl = it creates temorary preigned urls 
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

//creating a S3 client to make connection to AWS account 

const s3Client = new  S3Client({
    //aws region 
    region:process.env.AWS_REGION!,  //here the ! tells teh typescript that "these exist, trust me like that "


    //IAM user credentials
credentials: {
    accessKeyId:process.env.AWS_ACCESS_KEY!,
   secretAccessKey:process.env.AWS_SECRET_KEY!,

  },
});


//bucket name from .env
const BUCKET_NAME=process.env.AWS_S3_BUCKET_NAME!;


//  Generate Upload URL - it creates a temporary url to upload a file to s3
export async function generateUploadUrl(storedName: string): Promise<string> {
  // Tell S3 we want to upload (PUT) a file
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: storedName,  // The unique filename in S3
    // No ACL needed - bucket policy controls access
  });

  // Generate presigned URL valid for 5 minutes
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300,  // 300 seconds = 5 minutes
  });

  return signedUrl;
}


//  Generate Dowload URL - it creates a temporary url to download a file fro s3

export async function generateDownloadUrl(storedName:string): Promise<string> {
    
    
    //tell s3 i want to download this file from this bucket

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME, // our bucket name
        Key: storedName,  //this file name in the s3 bucket
    });
    
  //generate persigned url - created a temporary link valid for 300seconds like 5 min

  const signedUrl =await getSignedUrl(s3Client,command,{
    expiresIn:300,  // 300 seconds= 5 min 
  });

  //return the url //frontend will use this to dowload directly from s3 so return 
  return signedUrl;


}



