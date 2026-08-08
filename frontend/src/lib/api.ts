// ============================================
// API CLIENT
// The only file in your frontend that talks to the backend
// ============================================



// frontend/src/lib/api.ts

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Step 1: Send metadata to backend to get the presigned URL
export async function requestUploadUrl(metadata: {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isEncrypted: boolean;
})  {
  // console.log("[api.ts][requestUploadUrl][STEP 1] called with metadata:", metadata);
  const response = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });

  // console.log("[api.ts][requestUploadUrl][STEP 2] response status:", response.status);

  if (!response.ok) {
    const error = await response.json();
    // console.error("Upload request failed:", error);
    throw new Error(error.error?.message || "Failed to get upload URL");
  }

  const result= await response.json();
  // console.log("[api.ts][requestUploadUrl][STEP 3] success response:", result);
  return result;
}


// Step 3: Upload the file directly to S3 using the presigned URL
export async function uploadFileToS3(presignedUrl: string, file: File, signal?: AbortSignal) {
  // console.log("[api.ts][uploadFileToS3][STEP 1] start", {
    // presignedUrl,
    // fileName: file.name,
    // fileType: file.type,
    // fileSize: file.size,
  // });
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file, // The actual file bytes go in the body
    headers: {
      "Content-Type": file.type,
    },
     signal,
  });

  // console.log("[api.ts][uploadFileToS3][STEP 2] response status:", response.status);
   if (!response.ok) {
    // const rawError = await response.text().catch(() => "");
    // console.error("[api.ts][uploadFileToS3][STEP ERROR] S3 upload failed:", rawError);
    throw new Error("Failed to upload file to S3");
  }

  console.log("[api.ts][uploadFileToS3][STEP 3] upload success");
}




//Placeholder for Person B's download function
//=======================================================================

  // Fetches file metadata from the backend database

export async function fetchFileMetadata(token: string) {
  // Ask the backend for this file
  const response = await fetch(`${API_BASE}/api/file/${token}`);
  
  // Parse the JSON response
  const result = await response.json();
  
  // Check if backend said "success"
  if (!result.success) {
    // Backend sent an error message - throw it
    throw new Error(result.error?.message || "Failed to fetch file");
  }
  
  // Return the file data
  return result.data;
}


//===============================================================================

   // Dowload Api - it will request a download url from backend 

   //the dowload api returns  this is how the dowload reponse looks like (its just a typescript interface to describe the shape of the data we get back from the backend)
   export interface DownloadResponse {
    downloadUrl: string; // temporary S3 url (valid 5 min) // and this is the link provided by the aws not from backend url will default will be 7 days 
    originalName: string;  
    mimeType: string; 
    isEncrypted: boolean; 
    iv:string | null ;  
    salt: string| null; 
   }


//types  - these describe what the api sends back 
//every api response has this wrapper shpae  
//success :{success: ture, data:{...}}
//error: {success:false, error:{code:"..."}, message:"..."}

export interface ApiResponse<T>{
  success:boolean;
  data?:T; //optional
  error?:{
    code:string;
    message:string;
  };
}


   
  //  request a download url from the backend for given token and password 
   

   export async function requestDownloadUrl(token:string, password?:string):Promise<DownloadResponse>{
    // making a post request to backend 
    const response = await fetch(`${API_BASE}/api/download/${token}`,{
      method:"POST" ,  //post becase we send data -password
      headers:{
        "Content-Type":"application/json", //tell backend we are sending json data
      },
      body:JSON.stringify({password}),  //send password in body not in url 
    
    });

       //checking if the request failed 
       if(!response.ok){
        const error=await response.json();
        throw new Error(error?.error?.message || "Download request failed");

       }

       // parse the response as json 
       const result :  ApiResponse<DownloadResponse> = await response.json();

       //validate the response
       if(!result.success || !result.data){
        throw new Error("Invalid response from server");
       }

       //if everything alright return download data
       return result.data;



   }
