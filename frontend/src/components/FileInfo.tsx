// // defining the interface for the props that the FileInfo component will receive
// interface FileInfoProps {
//   file: File; // Uses the native browser File interface automatically
//   onRemove: () => void;
// }

// function FileInfo({ file, onRemove }: FileInfoProps) {
//   const isImage = file.type.startsWith('image/');
//   const imageUrl = isImage ? URL.createObjectURL(file) : null;
  
//   return (
//     <div className="mt-6 p-4 bg-white rounded-lg shadow">
//       {/* Shows selected file info */}
//       <p className="text-gray-700">
//         <strong>Selected File:</strong> {file.name}
//       </p>
      
//     {imageUrl && (
//   <div className="mt-4">
//     <img 
//       src={imageUrl} 
//       alt="Preview" 
//       className="max-h-48 rounded-lg shadow-sm border border-gray-200" 
//     />
//   </div>
// )}

//       <p className="text-gray-500 text-sm mt-1">
//         File Size: {(file.size / 1024).toFixed(2)} KB
//       </p>

//       <p className="text-gray-500 text-sm mt-1">
//         File Type: {file.type || "Unknown"}
//       </p>

//       <button 
//         className="mt-3 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-red-600" 
//         onClick={() => { 
//           onRemove();
//           // alert("File removed successfully!");
//         }}
//       >
//         Remove File
//       </button>
//     </div>
//   );
// }   

// export default FileInfo;



interface FileInfoProps {
  file: File;
  onRemove: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

export default function FileInfo({ file, onRemove }: FileInfoProps) {
  return (
    <div className="mb-3 flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-600">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-slate-900">{file.name}</div>
        <div className="text-xs text-slate-500">{formatSize(file.size)}</div>
      </div>
      <button onClick={onRemove} title="Remove" className="text-slate-400 transition hover:text-red-600">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
    </div>
  );
}