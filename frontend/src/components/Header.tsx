// import { Link } from "react-router-dom";

// export function Header() {
//   return (
//     <header className="bg-white border-b border-gray-200 px-6 py-4">
//       <div className="max-w-6xl mx-auto flex items-center justify-between">
//         <h1 className="text-xl text-blue-600 font-bold m-0">
//           VaultHub
//         </h1>
//         <nav className="flex gap-5">
//           <Link to="/" className="text-gray-500 hover:text-gray-900 text-sm no-underline">
//             Upload
//           </Link>
//           <Link to="/upload" className="text-gray-500 hover:text-gray-900 text-sm no-underline">
//             Download Redirect Page
//           </Link>
//           <Link to="/activity" className="text-gray-500 hover:text-gray-900 text-sm no-underline">
//             Activity Log
//           </Link>
//         </nav>
//       </div>
//     </header>
//   );
// }



// components/Header.tsx
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-lg text-sm">VH</span>
          VaultHub
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className={`font-medium transition-colors ${isActive("/") ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}>Upload</Link>
          <Link to="/how" className={`font-medium transition-colors ${isActive("/how") ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}>How it works</Link>
          <Link to="/about" className={`font-medium transition-colors ${isActive("/about") ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}>About</Link>
          <Link to="/faq" className={`font-medium transition-colors ${isActive("/faq") ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}>FAQ</Link>
          <Link to="/terms" className={`font-medium transition-colors ${isActive("/terms") ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}>Terms</Link>
          <Link to="/privacy" className={`font-medium transition-colors ${isActive("/privacy") ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}>Privacy</Link>
        </nav>
      </div>
    </header>
  );
}