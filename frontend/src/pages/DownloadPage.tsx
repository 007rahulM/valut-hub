import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import{fetchFileMetadata} from "../lib/api";

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
  const [file, setFile] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,setError] = useState<string | null>(null);




useEffect(()=>{
  //this function loads the real file data
  async function loadFile(){
    //if no token in url, show error immediately
    if(!token){
      setError("No file token provided");
      setLoading(false);
      return;
    }

    try{
      setLoading(true); //show loading spinner
      setError(null);  //clear any old error

      //thr real api call - asks backend for file data
      const data=await fetchFileMetadata(token);

      setFile(data);   //save the real data
      
    }catch(err){
      //something went wrong - show the error
      setError(err instanceof Error ? err.message : "Failed to load file");

    }finally{
      //always stop loading , whether success or failure 
      setLoading(false);
    }
  }
  loadFile();   //run the function 
},[token]);   //re-run if token changes





  // ========== LOADING STATE ==========
if (loading) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f5f5f5'
    }}>
      <div style={{ textAlign: 'center' }}>
        {/* Simple CSS Spinner */}
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          margin: '0 auto 16px auto',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          Loading file...
        </p>
      </div>
    </div>
  );
}

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{
          padding: '24px',
          background: '#fff0f0',
          border: '1px solid #ffcccc',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#cc0000', fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    );
  }

  // ========== MAIN PAGE ==========
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f5f5', 
      padding: '48px 16px' 
    }}>
      {/* White Card */}
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        border: '1px solid #e0e0e0'
      }}>

        {/* File Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          paddingBottom: '24px',
          marginBottom: '24px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          {/* File Icon */}
          <div style={{
            width: '48px',
            height: '48px',
            background: '#e8f0fe',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            📄
          </div>
          
          {/* File Name & Type */}
          <div>
            <h1 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1a1a1a',
              margin: '0 0 4px 0'
            }}>
              {file?.originalName}
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: '#666', 
              margin: 0 
            }}>
              {file?.mimeType}
            </p>
          </div>
        </div>

        {/* File Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <DetailItem label="Size" value={formatFileSize(file?.sizeBytes || 0)} />
          <DetailItem label="Expires" value={file?.expiresAt.split("T")[0] || ''} />
          <DetailItem label="Encrypted" value={file?.isEncrypted ? "Yes" : "No"} />
          <DetailItem label="Downloads" value={String(file?.downloadCount || 0)} />
        </div>

        {/* Password Input */}
        {file?.isEncrypted && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password to decrypt"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid #d0d0d0',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {/* Download Button */}
        <button style={{
          width: '100%',
          padding: '12px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Download File
        </button>

        {/* Token */}
        <p style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#ccc'
        }}>
          Token: {token}
        </p>

      </div>
    </div>
  );
}

// Helper component for detail items
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#999',
        fontWeight: '500',
        margin: '0 0 4px 0'
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '14px',
        color: '#333',
        fontWeight: '500',
        margin: 0
      }}>
        {value}
      </p>
    </div>
  );
}