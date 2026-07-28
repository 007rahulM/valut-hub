import { useState, useRef, useCallback } from "react";

// Define what the parent component must give us
interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  maxSize?: number; // in bytes, default 500MB
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export function FileUploader({ onFileSelect, maxSize = MAX_FILE_SIZE }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // useRef gives us direct access to the hidden HTML input element
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate file size and type (if needed)
  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      setError(`File too large. Maximum: ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
      return false;
    }

    // Define blocked extensions
    const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.sh', '.cmd'];

    // Check if the file name ends with any of these
    const hasBlockedExtension = BLOCKED_EXTENSIONS.some(ext => 
    file.name.toLowerCase().endsWith(ext)
    );

    if (hasBlockedExtension) {
    setError("File type not allowed for security reasons.");
    return false;
    }
    setError(null);
    return true;
  };

  // Process the file if valid
  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file); // Tell parent component about the file
    }
  };

  // Drag Over (MUST prevent default!)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  // Click to upload (via hidden input)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-white hover:bg-gray-50"
      }`}
    >
      {/* The hidden file input, linked to our ref */}
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        className="hidden"
      />

      <p className="text-gray-700 font-medium">
        Click to select a file
      </p>
      <p className="text-gray-500 text-sm mt-1">
        or drag and drop
      </p>
      <p className="text-gray-400 text-xs mt-2">
        Maximum file size: {(maxSize / 1024 / 1024).toFixed(0)}MB
      </p>

      {/* Show error if file is too large */}
      {error && (
        <p className="text-red-500 text-sm mt-3 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}