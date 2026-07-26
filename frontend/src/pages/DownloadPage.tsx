import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchFileMetadata, requestDownloadUrl } from "../lib/api";
import { triggerDownload,triggerDownloadFromArrayBuffer,triggerDownloadv2} from "../lib/download";
import{decryptFile} from "../lib/crypto";



interface FileMetadata {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isEncrypted: boolean;
  expiresAt: string;
  downloadCount: number;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function DownloadPage() {
  const { token } = useParams<{ token: string }>();
  
  // ===== ALL STATES INSIDE THE COMPONENT =====
  const [file, setFile] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [downloading, setDownloading] = useState(false);

  // ===== LOAD FILE METADATA WHEN PAGE OPENS =====
  useEffect(() => {
    async function loadFile() {
      if (!token) {
        setError("No file token provided");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await fetchFileMetadata(token);
        setFile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load file");
      } finally {
        setLoading(false);
      }
    }
    loadFile();
  }, [token]);

  // ===== HANDLE DOWNLOAD BUTTON CLICK =====
  const handleDownload = async () => {
    console.log("Step 1: Button clicked, requesting download URL...");
    console.log("token:", token);
    console.log("file:",file);

    if (!token || !file) {
      
      console.log("step 2 : missing token or file, stopping");
      
      return;
    }

    console.log("Step 2: token and file exist");
    setDownloading(true);
    setError(null);
    try {
      console.log("step 3: calling requestDownloadUrl...");
      const result = await requestDownloadUrl(
        token,
        file.isEncrypted ? password : undefined
      );
console.log("step 4: got result:",result);

      if (!result.isEncrypted) {
        console.log("step 5: file not encrypted , triggering download");
        console.log("URL:",result.downloadUrl);
        console.log("Filename:",result.originalName);
        triggerDownload(result.downloadUrl, result.originalName);
        console.log("step 6: triggeredDownload called ");

      } else {
      //Encrypted file : Download , decrypt then save
      console.log("File is encrypted, Downloading and decrypting...");

      //step 1: download the encrypted file as blob  from S3   //here blob is a file like object which is binary data
      const encryptedResponse = await fetch(result.downloadUrl);
      if(!encryptedResponse.ok){
        throw new Error("Failed to download encrypted file from S3");

      }

      //step 2: Get encrypted data as ArrayBuffer (binary data (continuous bytes))
      const encryptedData=await encryptedResponse.arrayBuffer();
      console.log("Downloaded encrypted file from S3");

      //step 3: Decrypt the file using the provided password, salt and iv 
      if(!result.salt || !result.iv){
        throw new Error("Missing encryption parameters");

      }

      const decryptedData=await decryptFile(
        encryptedData,
        password,
        result.salt,
        result.iv
      );
      console.log("Decryption was successful");

      // does blobb+object url +click +cleanup from the download.ts file
     triggerDownloadFromArrayBuffer(decryptedData,result.originalName,result.mimeType);

     console.log("File saved to Downloads Folder");
   


      }
    } catch (err) {
      console.log("Error in try block:",err);
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      console.log("finally block running");
      setDownloading(false);
    }
  };

  // ========== LOADING STATE ==========
   if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-gray-500 text-sm m-0">Loading file...</p>
        </div>
      </div>
    );
  }

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }
  // ========== MAIN PAGE ==========
   return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl p-8 border border-gray-200">
        {/* File Header */}
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-200">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
            📄
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 mb-1">
              {file?.originalName}
            </h1>
            <p className="text-sm text-gray-500 m-0">{file?.mimeType}</p>
          </div>
        </div>

        {/* File Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <DetailItem label="Size" value={formatFileSize(file?.sizeBytes || 0)} />
          <DetailItem label="Expires" value={file?.expiresAt.split("T")[0] || ""} />
          <DetailItem label="Encrypted" value={file?.isEncrypted ? "Yes" : "No"} />
          <DetailItem label="Downloads" value={String(file?.downloadCount || 0)} />
        </div>

        {/* Password Input */}
       {file?.isEncrypted && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password to decrypt"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}


        {/* Download Button */}
    <button
          onClick={handleDownload}
          disabled={downloading || (file?.isEncrypted && !password)}
          className="w-full p-3 bg-blue-600 disabled:bg-blue-300 text-white border-none rounded-lg text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70 hover:bg-blue-700 transition-colors"
        >
          {downloading ? "Downloading..." : "Download File"}
        </button>

        {/* Token */}
        <p className="mt-6 text-center text-xs text-gray-300">
          Token: {token}
        </p>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-1 m-0">
        {label}
      </p>
      <p className="text-sm text-gray-700 font-medium m-0">{value}</p>
    </div>
  );
}