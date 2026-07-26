import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-xl text-blue-600 font-bold m-0">
          VaultHub
        </h1>
        <nav className="flex gap-5">
          <Link to="/" className="text-gray-500 hover:text-gray-900 text-sm no-underline">
            Upload
          </Link>
          <Link to="/upload" className="text-gray-500 hover:text-gray-900 text-sm no-underline">
            Download Redirect Page
          </Link>
          <Link to="/activity" className="text-gray-500 hover:text-gray-900 text-sm no-underline">
            Activity Log
          </Link>
        </nav>
      </div>
    </header>
  );
}