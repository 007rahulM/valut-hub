
//this is a utility function that will trigger the browser to download a file from a given url and save it with the given filename
//creates a temporary link to save file to computer

/*
triggers the broswer to download a file from a url
@param url - the download url (presigned url from s3)
@param filename -  wt to name the saved file 

*/

export async function triggerDownload(url:string, filename:string):Promise<void>{

    try{
    //create a hidden <a> element
    const link = document.createElement("a");
    //set the download url
    link.href=url;  //we are linking here the url to the actual resouce url from s3 url the file storage there so now awaiting 
    //set the filename - wt user sees in save dialog
    link.download=filename;

    //hide it (don't show on page)
    link.style.display="none";

    //add to page (required for firefox)
    document.body.appendChild(link);

    //programmatically click it 
    link.click();

    //remove from page (cleanup)
    document.body.removeChild(link);

}catch(err){
 console.error("Download failed:",err);
        throw err;

}
}


//right now we are using above one //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//this is triggerDownloadv2 (version 2) wt is does and all is below 
//this function does the the same thing as above just the above one open or just fetch the url or the  blob url from anchor  and clean up it doesnot force to download directly  the below one does it 

export async function triggerDownloadv2(url:string, filename:string):Promise<void>{
    try{
        //fetch as a blob (binary data)
        //this prevent broser from opening it in a tab
        const response= await fetch(url);

        if(!response.ok){
            throw new Error("Faied to fetch file from S3");
        }

        //convert response to blob (blob is a file-like object)
        const blob=await response.blob();
        
        //created  a temporary url for the blob
        const bloburl=URL.createObjectURL(blob);

        //create hidden downloadn link //create hidden <a> anchor tag 
        const link=document.createElement("a");
        link.href=bloburl;

        link.download=filename;   //forces save as dialog  // so we will make that link to download  as a action 

        //trigger download link to get click because this function runs when the button is already clicked so 

        document.body.appendChild(link);
        link.click();

        //clean up 
        document.body.removeChild(link);
        URL.revokeObjectURL(bloburl);  //free the memeory which is holding url link 



    }catch(err){
        console.error("Download failed:",err);
        throw err;
    }

}





/* Trigger a browswer download from raw binary data (ArrayBuffer)
use this for decrypted file 

data- the raw file bytes (ArrayBuffer from decryptFile)
filename - what to name the downloaded file
mimeType - the file type (eg: application/pdf, image/png )


*/

export async function triggerDownloadFromArrayBuffer(
    data:ArrayBuffer,
    filename:string,
    mimeType:string
): Promise<void> {

    //1. wrap bytes in a blob gives it a file identity
    const blob=new Blob([data],{type:mimeType});

    //2. creating  a temporary url pointing to that blob in memeory
    const blobUrl=URL.createObjectURL(blob);

    //3. creating  a hidden <a> element and set its href to the blob url 
     const link=document.createElement("a");
     link.href=blobUrl;
     link.download=filename; //forces save as dialog
     document.body.appendChild(link);
     link.click();


     //4. cleanup prevents memeory leak 
     document.body.removeChild(link);
     URL.revokeObjectURL(blobUrl);

}