export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About VaultHub</h1>
        <div className="prose prose-blue text-gray-600 space-y-4">
          <p><strong>Our Mission:</strong> VaultHub was built with a simple, non-negotiable principle: your files should belong to you, and only you. We provide a secure, zero-knowledge file-sharing platform that is as easy to use as a standard link, but as secure as a locked vault.</p>
          <p><strong>Why It Matters:</strong> Every day, millions of sensitive files (contracts, medical records, design assets, source code) are shared through traditional email or cloud storage. Most services can read, scan, and analyze these files. VaultHub changes that by putting the encryption key in your hands, not ours.</p>
          <p><strong>Our Goal:</strong> To make privacy-first file sharing the default standard for everyone, from individual creators to enterprise teams, without compromising on speed or user experience.</p>
        </div>
      </div>
    </div>
  );
}