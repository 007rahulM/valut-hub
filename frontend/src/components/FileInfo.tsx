// defining the interface for the props that the FileInfo component will receive
interface FileInfoProps {
  file: File; // Uses the native browser File interface automatically
  onRemove: () => void;
}

function FileInfo({ file, onRemove }: FileInfoProps) {
  const isImage = file.type.startsWith('image/');
  const imageUrl = isImage ? URL.createObjectURL(file) : null;
  
  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      {/* Shows selected file info */}
      <p className="text-gray-700">
        <strong>Selected File:</strong> {file.name}
      </p>
      
    {imageUrl && (
  <div className="mt-4">
    <img 
      src={imageUrl} 
      alt="Preview" 
      className="max-h-48 rounded-lg shadow-sm border border-gray-200" 
    />
  </div>
)}

      <p className="text-gray-500 text-sm mt-1">
        File Size: {(file.size / 1024).toFixed(2)} KB
      </p>

      <p className="text-gray-500 text-sm mt-1">
        File Type: {file.type || "Unknown"}
      </p>

      <button 
        className="mt-3 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-red-600" 
        onClick={() => { 
          onRemove();
          alert("File removed successfully!");
        }}
      >
        Remove File
      </button>
    </div>
  );
}   

export default FileInfo;