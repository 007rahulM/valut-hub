import { useState } from "react";
import { FileUploader } from "../components/FileUploader";
import FileInfo from "../components/FileInfo";
import {requestUploadUrl, uploadFileToS3} from "../lib/api"; 
import { encryptFile } from "../lib/crypto";
import toast from "react-hot-toast";

import { Link } from "react-router-dom"; 

function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading"|"encrypting" | "success" | "error">("idle");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [password, setPassword] = useState(""); 
    const [acceptedTerms, setAcceptedTerms] = useState(false); 

  // Simulate upload progress
  const simulateUpload = () => {
      // console.log("[UploadPage] simulateUpload:start");
    
    setIsUploading(true);
    setUploadProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      //  console.log("[UploadPage] simulateUpload:progress", progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          //  console.log("[UploadPage] simulateUpload:done");
        }, 500);
      }
    }, 200); // Updates every 200ms = 2 seconds total
  };

  // Handle file selection and start the progress simulation
  const handleFileSelect = (file: File) => {
    //  console.log("[UploadPage] handleFileSelect:file", {
      // name: file.name,
      // type: file.type,
      // size: file.size,
    // });
    setSelectedFile(file);
    simulateUpload();
    
    // ✅ TOAST: file selected
    toast.success(`File selected: ${file.name}`, { duration: 2500 });
  };


   const handleFinalUpload = async () => {
    //  console.log(` STEP 0: handleFinalUpload called`);
  if (!selectedFile){
    // console.log(`STEP 0.1: no selectedFile, return`);
     // ✅ TOAST: password missing
      toast.error("Please enter a password for encryption.", { duration: 3000 });
    return;

  }



  if (isEncrypted && !password) {
    //  console.log(`[ STEP 0.2: encryption enabled but password missing`);
    setErrorMessage("Please enter a password for encryption.");
    setUploadStatus("error");
    return;
  }

     // ✅ Check terms acceptance
    if (!acceptedTerms) {
      setErrorMessage("You must agree to the Terms of Service and Privacy Policy.");
      setUploadStatus("error");
      toast.error("Please accept the Terms & Privacy Policy.", { duration: 3000 });
      return;
    }


   // start upload toast (loading spinner)
    const uploadToastId = toast.loading("Preparing upload...", { duration: Infinity });
  try {
    // console.log(`[STEP 1: set uploading status`);
    setUploadStatus("uploading");
    setErrorMessage(null);

    let fileToUpload = selectedFile;
    let salt = null;
    let iv = null;

    //  console.log(` STEP 2: selected file`, {
        // name: selectedFile.name,
        // type: selectedFile.type,
        // size: selectedFile.size,
        // isEncrypted,
      // });

    // IF ENCRYPTED: Encrypt the file first!
    if (isEncrypted) {
      // console.log(` STEP 3: encryptFile:start`);
      setUploadStatus("encrypting"); // Update UI to show encryption is happening
      toast.loading("Encrypting file...", { id: uploadToastId }); // update loading text
      const encryptionResult = await encryptFile(selectedFile, password);
      fileToUpload = encryptionResult.encryptedFile;
      salt = encryptionResult.salt;
      iv = encryptionResult.iv;
        // console.log(` STEP 3 DONE: encryptFile:success`, {
          // encryptedSize: fileToUpload.size,
          // hasSalt: !!salt,
          // hasIv: !!iv,
        // });
    }

    setUploadStatus("uploading"); // Back to uploading
     toast.loading("Uploading to cloud...", { id: uploadToastId });

    // Step 1: Send metadata to backend
    //  console.log(`STEP 4: prepare metadata`);
    const metadata = {
      originalName: selectedFile.name,
      mimeType: isEncrypted ? "application/octet-stream" : selectedFile.type,
      sizeBytes: fileToUpload.size,
      isEncrypted: isEncrypted,
      passwordHash: isEncrypted ? await hashPassword(password) : null, // We'll add this helper next
      iv: iv,
      salt: salt,
    };
    // console.log(` STEP 4 DONE: metadata`, metadata);

    //  console.log(` STEP 5: requestUploadUrl:start`);
    const backendResponse = await requestUploadUrl(metadata);
    //  console.log(`STEP 5 DONE: requestUploadUrl:success`, backendResponse);
    const { presignedUrl, shareUrl: newShareUrl } = backendResponse.data;
    //  console.log(` STEP 6: uploadFileToS3:start`, { presignedUrl });

    // Step 2: Upload file (encrypted or not) directly to S3
    await uploadFileToS3(presignedUrl, fileToUpload);
  console.log(` STEP 6 DONE: uploadFileToS3:success`);
    // Step 3: Success!
    setShareUrl(newShareUrl);
    setUploadStatus("success");
    // console.log("Upload successful! Share URL:", newShareUrl);
    
    // ✅ TOAST: success – replaces the loading toast
      toast.success("Upload complete! Link is ready.", { id: uploadToastId, duration: 4000 });


  } catch (error) {
    console.error("Upload failed:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(msg);
    setUploadStatus("error");

     // ✅ TOAST: error – replaces loading toast
      toast.error(msg, { id: uploadToastId, duration: 4000 });
  }
  finally {
// console.log(`STEP END: handleFinalUpload finished`);
  }
};

// Helper to hash the password for the backend (so backend can verify it later)
async function hashPassword(password: string) {
  // console.log("[UploadPage] hashPassword:start");
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const result=hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  //  console.log("[UploadPage] hashPassword:done");
   return result;
}
 // ✅ Helper: copy link to clipboard with toast
  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!", { duration: 2000 });
    }
  };

  return (
    <div className="min-h-screen bg-white-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white-800 mb-6">
          File Upload
        </h1>

        {/* UPDATED: Use handleFileSelect */}
        <FileUploader onFileSelect={handleFileSelect} />

        {/* Show progress bar when uploading */}
        {isUploading && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Show file info if a file is selected */}
        {selectedFile && (
          <FileInfo 
            file={selectedFile} 
            onRemove={() => {setSelectedFile(null)
              // ✅ TOAST: file removed
              toast("File removed", { icon: "🗑️", duration: 2000 });
            }}
          />
        )}

        {/* Encryption toggle */}
        {selectedFile && (
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="encrypt-toggle"
              checked={isEncrypted}
              onChange={(e) => setIsEncrypted(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="encrypt-toggle" className="ml-2 text-gray-700">
              Encrypt File
            </label>
          </div>
        )}

        {/* Password input for encryption */}
        {isEncrypted && (
           <input
                type="password"
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
  />
)}     

           {/* ✅ Terms & Privacy Checkbox */}
        {selectedFile && (
          <div className="mt-4 flex items-start">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="terms-checkbox" className="ml-2 text-sm text-gray-700">
              I agree to the{" "}
              <Link to="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
        )}

                {/* Upload Button (Only show if file selected and not yet uploaded) */}
        {selectedFile && uploadStatus === "idle" && (
          <button
            onClick={handleFinalUpload}
            disabled={!acceptedTerms}  
  className={`mt-6 w-full py-3 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
    acceptedTerms
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-blue-300 text-gray-100 cursor-not-allowed"
  }`}
          >
             Upload to Cloud
          </button>
        )}

        {/* Uploading State */}
        {uploadStatus === "uploading" && (
          <div className="mt-6 text-center text-blue-600 font-medium animate-pulse">
            Uploading to secure cloud storage...
          </div>
        )}

        {/* Success State */}
        {uploadStatus === "success" && shareUrl && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-bold mb-2">✅ Upload Successful!</p>
            <p className="text-sm text-green-700 mb-2">Share this link with your recipient:</p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="flex-1 p-2 border border-green-300 rounded bg-white text-sm"
              />
              <button 
                // onClick={() => navigator.clipboard.writeText(shareUrl)}
                onClick={handleCopyLink}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {uploadStatus === "error" && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-bold">❌ Upload Failed</p>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            <button 
              onClick={() => { setUploadStatus("idle"); setErrorMessage(null); }}
              className="mt-3 text-sm text-red-600 underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPage;