import { useState } from "react";
import FileInfo from "../components/FileInfo";


function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Drag and Drop handlers
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setSelectedFile(droppedFile);
    }
  };

    const handleUploadToServer = async () => {
    if (!selectedFile) return;

    // 1. Create a FormData object (this is how browsers send files)
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // 2. Send it to our local backend
      const response = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData, // Do NOT set Content-Type header! Browser does it automatically for FormData
      });

      const data = await response.json();
      console.log("Server says:", data.message);
      alert("File saved to your codebase! Check the backend/uploads folder.");
      
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          File Upload
        </h1>

        {/* Drop Zone */}

        <div 
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 bg-white"
          }`}
        >
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
          >
            Click to select a file
          </label>
          <p className="text-gray-500 mt-2">or drag and drop</p>
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="mt-6">
            <FileInfo file={selectedFile} onRemove={() => setSelectedFile(null)} />

            {/* Encryption Toggle */}
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
            
            {/* Upload Button */}
            <button
              onClick={handleUploadToServer}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Upload to Server
            </button>
          </div>        
        
        )}
      </div>
    </div>
  );
}

export default UploadPage;