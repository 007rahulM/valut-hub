// defining the interface for the props that the FileInfo component will receive
interface FileInfoProps {
  file: File; // Uses the native browser File interface automatically
  onRemove: () => void;
}

function FileInfo({ file, onRemove }: FileInfoProps) {
  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      {/* Shows selected file info */}
      <p className="text-gray-700">
        <strong>Selected File:</strong> {file.name}
      </p>
      
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