import { useState } from "react";
import { FileUploader } from "../components/FileUploader";
import FileInfo from "../components/FileInfo";

function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          File Upload
        </h1>

        {/*  the FileUploader component */}
        <FileUploader onFileSelect={setSelectedFile} />

        {/* Show file info if a file is selected */}
        {selectedFile && (
          <FileInfo 
            file={selectedFile} 
            onRemove={() => setSelectedFile(null)} 
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
      </div>
    </div>
  );
}

export default UploadPage;