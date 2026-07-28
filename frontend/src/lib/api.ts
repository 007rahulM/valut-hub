// ============================================
// API CLIENT
// The only file in your frontend that talks to the backend
// ============================================



const API_BASE = "http://localhost:3001";

//=======================================================================
/**
 * Fetches file metadata from the backend database
 * @param token - The file token from the URL (e.g., "test123")
 * @returns The file information object
 * @throws Error if file not found, expired, or server problem
 */



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


   /*
   request a download url from the backend for given token and password 
   @param token - the file token from the url
   @param password - Optiona, only if file is encrypted
   @returns DownloadResponse with presigned url
   
   */


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