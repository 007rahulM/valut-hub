// pages/HowItWorksPage.tsx
export function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">How it works</h1>
        <p className="text-sm text-slate-500 mb-6">Zero-knowledge encryption in four steps</p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Select your file</h4>
              <p className="text-sm text-slate-500">Drag and drop or click to choose a file from your device. We support files up to 500 MB.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Encrypt in your browser</h4>
              <p className="text-sm text-slate-500">If you choose encryption, we use the Web Crypto API to encrypt your file with AES-GCM. A unique password is generated, or you can set your own. The password never leaves your device.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Upload to cloud storage</h4>
              <p className="text-sm text-slate-500">The encrypted file bytes are uploaded directly to secure cloud storage using a presigned URL. Our server only sees metadata — filename, size, and encryption parameters — never the actual content.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Share the link</h4>
              <p className="text-sm text-slate-500">You get a unique share link . Send the link to your recipient. Share the password separately. Only someone with both the link and password can decrypt and download the file.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Decryption process</h3>
          <p className="text-sm text-slate-500">When the recipient clicks the link, they enter the password. Their browser downloads the encrypted file, derives the same AES key using PBKDF2 with the stored salt, and decrypts the file locally. The decrypted file is then saved to their device. At no point does our server see the password or the unencrypted content.</p>
        </div>
      </div>
    </div>
  );
}