// import { useState } from "react";
// import { FileUploader } from "../components/FileUploader";
// import FileInfo from "../components/FileInfo";
// import {requestUploadUrl, uploadFileToS3} from "../lib/api"; 
// import { encryptFile } from "../lib/crypto";
// import toast from "react-hot-toast";

// import { Link } from "react-router-dom"; 

// function UploadPage() {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [isEncrypted, setIsEncrypted] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading"|"encrypting" | "success" | "error">("idle");
//   const [shareUrl, setShareUrl] = useState<string | null>(null);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [password, setPassword] = useState(""); 
//     const [acceptedTerms, setAcceptedTerms] = useState(false); 

//   // Simulate upload progress
//   const simulateUpload = () => {
//       // console.log("[UploadPage] simulateUpload:start");
    
//     setIsUploading(true);
//     setUploadProgress(0);
    
//     let progress = 0;
//     const interval = setInterval(() => {
//       progress += 10;
//       setUploadProgress(progress);
//       //  console.log("[UploadPage] simulateUpload:progress", progress);
      
//       if (progress >= 100) {
//         clearInterval(interval);
//         setTimeout(() => {
//           setIsUploading(false);
//           setUploadProgress(0);
//           //  console.log("[UploadPage] simulateUpload:done");
//         }, 500);
//       }
//     }, 200); // Updates every 200ms = 2 seconds total
//   };

//   // Handle file selection and start the progress simulation
//   const handleFileSelect = (file: File) => {
//     //  console.log("[UploadPage] handleFileSelect:file", {
//       // name: file.name,
//       // type: file.type,
//       // size: file.size,
//     // });
//     setSelectedFile(file);
//     simulateUpload();
    
//     // ✅ TOAST: file selected
//     toast.success(`File selected: ${file.name}`, { duration: 2500 });
//   };


//    const handleFinalUpload = async () => {
//     //  console.log(` STEP 0: handleFinalUpload called`);
//   if (!selectedFile){
//     // console.log(`STEP 0.1: no selectedFile, return`);
//      // ✅ TOAST: password missing
//       toast.error("Please enter a password for encryption.", { duration: 3000 });
//     return;

//   }



//   if (isEncrypted && !password) {
//     //  console.log(`[ STEP 0.2: encryption enabled but password missing`);
//     setErrorMessage("Please enter a password for encryption.");
//     setUploadStatus("error");
//     return;
//   }

//      // ✅ Check terms acceptance
//     if (!acceptedTerms) {
//       setErrorMessage("You must agree to the Terms of Service and Privacy Policy.");
//       setUploadStatus("error");
//       toast.error("Please accept the Terms & Privacy Policy.", { duration: 3000 });
//       return;
//     }


//    // start upload toast (loading spinner)
//     const uploadToastId = toast.loading("Preparing upload...", { duration: Infinity });
//   try {
//     // console.log(`[STEP 1: set uploading status`);
//     setUploadStatus("uploading");
//     setErrorMessage(null);

//     let fileToUpload = selectedFile;
//     let salt = null;
//     let iv = null;

//     //  console.log(` STEP 2: selected file`, {
//         // name: selectedFile.name,
//         // type: selectedFile.type,
//         // size: selectedFile.size,
//         // isEncrypted,
//       // });

//     // IF ENCRYPTED: Encrypt the file first!
//     if (isEncrypted) {
//       // console.log(` STEP 3: encryptFile:start`);
//       setUploadStatus("encrypting"); // Update UI to show encryption is happening
//       toast.loading("Encrypting file...", { id: uploadToastId }); // update loading text
//       const encryptionResult = await encryptFile(selectedFile, password);
//       fileToUpload = encryptionResult.encryptedFile;
//       salt = encryptionResult.salt;
//       iv = encryptionResult.iv;
//         // console.log(` STEP 3 DONE: encryptFile:success`, {
//           // encryptedSize: fileToUpload.size,
//           // hasSalt: !!salt,
//           // hasIv: !!iv,
//         // });
//     }

//     setUploadStatus("uploading"); // Back to uploading
//      toast.loading("Uploading to cloud...", { id: uploadToastId });

//     // Step 1: Send metadata to backend
//     //  console.log(`STEP 4: prepare metadata`);
//     const metadata = {
//       originalName: selectedFile.name,
//       mimeType: isEncrypted ? "application/octet-stream" : selectedFile.type,
//       sizeBytes: fileToUpload.size,
//       isEncrypted: isEncrypted,
//       passwordHash: isEncrypted ? await hashPassword(password) : null, // We'll add this helper next
//       iv: iv,
//       salt: salt,
//     };
//     // console.log(` STEP 4 DONE: metadata`, metadata);

//     //  console.log(` STEP 5: requestUploadUrl:start`);
//     const backendResponse = await requestUploadUrl(metadata);
//     //  console.log(`STEP 5 DONE: requestUploadUrl:success`, backendResponse);
//     const { presignedUrl, shareUrl: newShareUrl } = backendResponse.data;
//     //  console.log(` STEP 6: uploadFileToS3:start`, { presignedUrl });

//     // Step 2: Upload file (encrypted or not) directly to S3
//     await uploadFileToS3(presignedUrl, fileToUpload);
//   console.log(` STEP 6 DONE: uploadFileToS3:success`);
//     // Step 3: Success!
//     setShareUrl(newShareUrl);
//     setUploadStatus("success");
//     // console.log("Upload successful! Share URL:", newShareUrl);
    
//     // ✅ TOAST: success – replaces the loading toast
//       toast.success("Upload complete! Link is ready.", { id: uploadToastId, duration: 4000 });


//   } catch (error) {
//     console.error("Upload failed:", error);
//     const msg = error instanceof Error ? error.message : "Unknown error";
//       setErrorMessage(msg);
//     setUploadStatus("error");

//      // ✅ TOAST: error – replaces loading toast
//       toast.error(msg, { id: uploadToastId, duration: 4000 });
//   }
//   finally {
// // console.log(`STEP END: handleFinalUpload finished`);
//   }
// };

// // Helper to hash the password for the backend (so backend can verify it later)
// async function hashPassword(password: string) {
//   // console.log("[UploadPage] hashPassword:start");
//   const encoder = new TextEncoder();
//   const data = encoder.encode(password);
//   const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   const result=hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
//   //  console.log("[UploadPage] hashPassword:done");
//    return result;
// }
//  // ✅ Helper: copy link to clipboard with toast
//   const handleCopyLink = () => {
//     if (shareUrl) {
//       navigator.clipboard.writeText(shareUrl);
//       toast.success("Link copied to clipboard!", { duration: 2000 });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white-50 p-8">
//       <div className="max-w-2xl mx-auto">
//         <h1 className="text-3xl font-bold text-white-800 mb-6">
//           File Upload
//         </h1>

//         {/* UPDATED: Use handleFileSelect */}
//         <FileUploader onFileSelect={handleFileSelect} />

//         {/* Show progress bar when uploading */}
//         {isUploading && (
//           <div className="mt-6">
//             <div className="w-full bg-gray-200 rounded-full h-2.5">
//               <div
//                 className="bg-blue-600 h-2.5 rounded-full transition-all duration-200"
//                 style={{ width: `${uploadProgress}%` }}
//               ></div>
//             </div>
//             <p className="text-center text-sm text-gray-600 mt-2">
//               Uploading... {uploadProgress}%
//             </p>
//           </div>
//         )}

//         {/* Show file info if a file is selected */}
//         {selectedFile && (
//           <FileInfo 
//             file={selectedFile} 
//             onRemove={() => {setSelectedFile(null)
//               // ✅ TOAST: file removed
//               toast("File removed", { icon: "🗑️", duration: 2000 });
//             }}
//           />
//         )}

//         {/* Encryption toggle */}
//         {selectedFile && (
//           <div className="mt-4 flex items-center">
//             <input
//               type="checkbox"
//               id="encrypt-toggle"
//               checked={isEncrypted}
//               onChange={(e) => setIsEncrypted(e.target.checked)}
//               className="h-4 w-4 text-blue-600 rounded"
//             />
//             <label htmlFor="encrypt-toggle" className="ml-2 text-gray-700">
//               Encrypt File
//             </label>
//           </div>
//         )}

//         {/* Password input for encryption */}
//         {isEncrypted && (
//            <input
//                 type="password"
//                 placeholder="Enter a strong password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="mt-2 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
//   />
// )}     

//            {/* ✅ Terms & Privacy Checkbox */}
//         {selectedFile && (
//           <div className="mt-4 flex items-start">
//             <input
//               type="checkbox"
//               id="terms-checkbox"
//               checked={acceptedTerms}
//               onChange={(e) => setAcceptedTerms(e.target.checked)}
//               className="mt-1 h-4 w-4 text-blue-600 rounded"
//             />
//             <label htmlFor="terms-checkbox" className="ml-2 text-sm text-gray-700">
//               I agree to the{" "}
//               <Link to="/terms" className="text-blue-600 hover:underline">
//                 Terms of Service
//               </Link>{" "}
//               and{" "}
//               <Link to="/privacy" className="text-blue-600 hover:underline">
//                 Privacy Policy
//               </Link>
//             </label>
//           </div>
//         )}

//                 {/* Upload Button (Only show if file selected and not yet uploaded) */}
//         {selectedFile && uploadStatus === "idle" && (
//           <button
//             onClick={handleFinalUpload}
//             disabled={!acceptedTerms}  
//   className={`mt-6 w-full py-3 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
//     acceptedTerms
//       ? "bg-blue-600 text-white hover:bg-blue-700"
//       : "bg-blue-300 text-gray-100 cursor-not-allowed"
//   }`}
//           >
//              Upload to Cloud
//           </button>
//         )}

//         {/* Uploading State */}
//         {uploadStatus === "uploading" && (
//           <div className="mt-6 text-center text-blue-600 font-medium animate-pulse">
//             Uploading to secure cloud storage...
//           </div>
//         )}

//         {/* Success State */}
//         {uploadStatus === "success" && shareUrl && (
//           <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//             <p className="text-green-800 font-bold mb-2">✅ Upload Successful!</p>
//             <p className="text-sm text-green-700 mb-2">Share this link with your recipient:</p>
//             <div className="flex items-center gap-2">
//               <input 
//                 type="text" 
//                 value={shareUrl} 
//                 readOnly 
//                 className="flex-1 p-2 border border-green-300 rounded bg-white text-sm"
//               />
//               <button 
//                 // onClick={() => navigator.clipboard.writeText(shareUrl)}
//                 onClick={handleCopyLink}
//                 className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
//               >
//                 Copy
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Error State */}
//         {uploadStatus === "error" && (
//           <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//             <p className="text-red-800 font-bold">❌ Upload Failed</p>
//             <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
//             <button 
//               onClick={() => { setUploadStatus("idle"); setErrorMessage(null); }}
//               className="mt-3 text-sm text-red-600 underline hover:text-red-800"
//             >
//               Try Again
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default UploadPage;


//====================================================================



// ============================================================
// UploadPage — THE SENDER'S VIEW 
//
// Three windows, exactly like the PDF:
//   step "drop"    → drag & drop box + explanation (with tap-friendly tooltips)
//   step "options" → file row + downloads selector + encryption switch + password
//   step "link"    → copy-link window + status strip
//
// The heavy logic (AES-GCM, presigned URLs) lives in src/lib/* — untouched.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Clock, Download, HardDrive } from "lucide-react";
import { FileDropzone } from "../components/FileDropzone";
import { UploadOptions } from "../components/upload/UploadOptions";
import { ShareLinkCard } from "../components/upload/ShareLinkCard";
import { Term } from "../components/Term";
import { requestUploadUrl, uploadFileToS3 } from "../lib/api";
import { encryptFile } from "../lib/crypto";

const EXPIRY_SECONDS = 24 * 60 * 60; // 1 day ONLY (product rule)
const MAX_DOWNLOADS = 10;             // hard cap (product rule)

// Human-readable file size for the options window
function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

// SHA-256 hash of the password — this is ONLY a verifier for the backend.
// The REAL key is derived client-side with PBKDF2 and never leaves the browser.
async function hashPassword(password: string): Promise<string> {
  const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function UploadPage() {
  // Which of the 3 windows we're showing right now
  const [step, setStep] = useState<"drop" | "options" | "link">("drop");
  const [file, setFile] = useState<File | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(true); // encryption ON by default
  const [password, setPassword] = useState("");
  const [maxDownloads, setMaxDownloads] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState("24h 0m 0s");

  // Live countdown shown in the status strip after the link is copied.
  // setState inside the interval CALLBACK is async → lint-safe.
  useEffect(() => {
    if (!createdAt) return;
    const interval = window.setInterval(() => {
      const diff = Math.max(0, createdAt + EXPIRY_SECONDS * 1000 - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => window.clearInterval(interval); // cleanup on unmount
  }, [createdAt]);

  // Dropzone hands us the chosen file → move to the options window
  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setStep("options");
    toast.success(`Selected: ${f.name}`, { duration: 2500 });
  }, []);

  // The full upload pipeline: encrypt → register → PUT bytes to S3
  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file.");
    if (isEncrypted && !password) return toast.error("Please enter a password for encryption.");
    if (!acceptedTerms) return toast.error("Please accept the Terms & Privacy Policy.");

    // Fail fast if the device is already offline
    if (!navigator.onLine) {
      toast.error("You're offline — check your internet and try again.");
      return;
    }

    const toastId = toast.loading("Preparing upload...");

    // If the internet DIES mid-upload, abort instantly (no 1-minute spinner).
    const controller = new AbortController();
    const goOffline = () => controller.abort();
    window.addEventListener("offline", goOffline);

    try {
      setIsWorking(true);
      let fileToUpload: File | Blob = file;
      let salt: string | null = null;
      let iv: string | null = null;

      // STEP 1: encrypt LOCALLY (AES-GCM + PBKDF2) before anything leaves the device
      if (isEncrypted) {
        toast.loading("Encrypting file...", { id: toastId });
        const enc = await encryptFile(file, password);
        fileToUpload = enc.encryptedFile;
        salt = enc.salt;
        iv = enc.iv;
      }

      // STEP 2: register metadata with backend → get presigned S3 URL + share link
      toast.loading("Uploading to cloud...", { id: toastId });
      const metadata = {
        originalName: file.name,
        mimeType: isEncrypted ? "application/octet-stream" : file.type,
        sizeBytes: fileToUpload.size,
        isEncrypted,
        passwordHash: isEncrypted ? await hashPassword(password) : null,
        iv,
        salt,
        expirySeconds: EXPIRY_SECONDS,
        maxDownloads,
      };
      const res = await requestUploadUrl(metadata);
      const { presignedUrl, shareUrl: newShareUrl } = res.data;

      // STEP 3: PUT the (locked) bytes DIRECTLY to S3 — server never touches them
      await uploadFileToS3(presignedUrl, fileToUpload as File, controller.signal);

      // Success → show the copy-link window
      setShareUrl(newShareUrl);
      setCreatedAt(Date.now());
      setStep("link");
      toast.success("Upload complete!", { id: toastId });
    } catch (err) {
      // Give a precise reason when the abort was caused by losing internet
      if (!navigator.onLine) {
        toast.error("Your internet dropped during upload. Please try again.", { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Upload failed", { id: toastId });
      }
    } finally {
      window.removeEventListener("offline", goOffline); // always clean up
      setIsWorking(false);
    }
  };

  // Copy the share link to clipboard
  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!", { duration: 2000 });
  };

  // "Share another file" → reset everything back to the drop window
  const reset = () => {
    setStep("drop");
    setFile(null);
    setPassword("");
    setShareUrl(null);
    setCopied(false);
    setCreatedAt(null);
  };

  return (
    <Container size="lg" py="xl">
      {/* ---------- WINDOW 1: drag & drop + explanation ---------- */}
      {step === "drop" && (
        <Card withBorder shadow="sm" radius="lg" p="xl">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <FileDropzone onFileSelect={handleFileSelect} />
            <Stack justify="center" gap="md">
              <Title order={2}>Simple, private file sharing</Title>
              <Text c="dimmed" fz="sm" lh={1.8}>
                VaultHub lets you share files with{" "}
                <Term tip="End-to-end encryption prevents your files from falling into the wrong hands. Files are encrypted in your browser before upload and can only be unlocked with the correct password — even we cannot read them.">
                  end-to-end encryption
                </Term>{" "}
                and a{" "}
                <Term tip="Every link is automatically deleted from our servers after 1 day, or after the number of downloads you choose. Nothing stays online forever.">
                  link that automatically expires
                </Term>. Only the designated recipient will be able to download the file.
              </Text>
              {/* The 3 product limits, as quiet facts */}
              <Stack gap={6} mt={4}>
                <Group gap={8}>
                  <HardDrive size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} />
                  <Text fz="xs" c="dimmed">Share files up to 500 MB.</Text>
                </Group>
                <Group gap={8}>
                  <Clock size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} />
                  <Text fz="xs" c="dimmed">Keep link open for up to 1 day.</Text>
                </Group>
                <Group gap={8}>
                  <Download size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} />
                  <Text fz="xs" c="dimmed">Link expires after up to {MAX_DOWNLOADS} downloads.</Text>
                </Group>
              </Stack>
            </Stack>
          </SimpleGrid>
        </Card>
      )}

      {/* ---------- WINDOW 2: file options ---------- */}
      {step === "options" && file && (
        <Card withBorder shadow="sm" radius="lg" p="xl" mx="auto" maw={640}>
          <UploadOptions
            fileName={file.name}
            fileSizeLabel={formatBytes(file.size)}
            maxDownloads={maxDownloads}
            onMaxDownloadsChange={setMaxDownloads}
            isEncrypted={isEncrypted}
            onIsEncryptedChange={setIsEncrypted}
            password={password}
            onPasswordChange={setPassword}
            acceptedTerms={acceptedTerms}
            onAcceptedTermsChange={setAcceptedTerms}
            isWorking={isWorking}
            onUpload={handleUpload}
            onRemoveFile={() => { setFile(null); setStep("drop"); }}
          />
        </Card>
      )}

      {/* ---------- WINDOW 3: copy link + status ---------- */}
      {step === "link" && shareUrl && (
        <Card withBorder shadow="sm" radius="lg" p="xl" mx="auto" maw={640}>
          <ShareLinkCard
            shareUrl={shareUrl}
            copied={copied}
            isEncrypted={isEncrypted}
            maxDownloads={maxDownloads}
            timeLeft={timeLeft}
            onCopy={handleCopy}
            onReset={reset}
          />
        </Card>
      )}
    </Container>
  );
}

export default UploadPage;