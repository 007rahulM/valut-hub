// ============================================
// API CLIENT
// The only file in your frontend that talks to the backend
// ============================================

const API_BASE = "http://localhost:3001";

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