// ============================================
// API CLIENT
// The only file in your frontend that talks to the backend
// ============================================



// frontend/src/lib/api.ts

const API_BASE = "http://localhost:3001";

// Step 1: Send metadata to backend to get the presigned URL
export async function requestUploadUrl(metadata: {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isEncrypted: boolean;
}) {
  const response = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to get upload URL");
  }

  return response.json();
}

// Step 3: Upload the file directly to S3 using the presigned URL
export async function uploadFileToS3(presignedUrl: string, file: File) {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file, // The actual file bytes go in the body
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to upload file to S3");
  }
}




//Placeholder for Person B's download function
export async function fetchFileMetadata(token: string) {
  const response = await fetch(`${API_BASE}/api/file/${token}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch file metadata");
  }
  
  return response.json();
}


export async function requestDownloadUrl(token: string, password?: string) {
  const response = await fetch(`${API_BASE}/api/download/${token}`, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
    },
    body: password ? JSON.stringify({ password }) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to generate download URL");
  }
  return response.json();
}