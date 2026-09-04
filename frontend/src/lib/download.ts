



//---------------------------------------------
// ============================================================
// DOWNLOAD HELPERS
// FIX: the anchor MUST be in the DOM (Firefox) and the object URL
// must NOT be revoked immediately, otherwise big files silently
// never appear in the Downloads folder.
// ============================================================
import { ApiError } from "./api";

export function downloadBlobWithProgress(url: string, onProg?: (p: number | null) => void): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.onprogress = (e) => { if (e.lengthComputable) onProg?.(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => {
            if (xhr.status < 300) resolve(xhr.response as Blob);
            else reject(new ApiError("Download failed (S3 said " + xhr.status + ")", "S3_DOWNLOAD_FAILED"));
        };
        xhr.onerror = () => reject(new ApiError("Network error during download", "NETWORK_ERROR"));
        xhr.send();
    });
}

// The robust "save to disk" routine
function saveBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    // Give the browser 60s to start reading the blob before we free it
    window.setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 60_000);
}

export function triggerDownloadFromBlob(blob: Blob, fileName: string) {
    saveBlob(blob, fileName);
}

export function triggerDownloadFromArrayBuffer(buf: ArrayBuffer, fileName: string, mimeType: string) {
    saveBlob(new Blob([buf], { type: mimeType || "application/octet-stream" }), fileName);
}