import { useState } from "react";

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

        {/* Show selected file info */}
        {selectedFile && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <p className="text-gray-700">
              <strong>Selected File:</strong> {selectedFile.name}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              File Size: {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
            
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
            </div>
        )}
      </div>
    </div>
  );
}

export default UploadPage;