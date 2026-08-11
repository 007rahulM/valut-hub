// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import { DownloadPage } from "./pages/DownloadPage"; 
// import {Header} from "./components/Header";
// import UploadPage from "./pages/UploadPage";

// function App() {
//   return (
//     <BrowserRouter>
//     <Header/>  {/*header is shown in every page because this is in outside of the routes */}
//       <Routes>
//       {/* Home page - Upload page */}

  
//         <Route path="/" element={<UploadPage />} />

//        { /* upload route for me  */}
//          {/* Test links page */}
//         <Route path="/upload" element={
//           <div className="p-10 text-center">
//             <h1 className="text-2xl font-bold text-gray-900">Welcome to Vault Hub</h1>
//             <p className="text-base mt-2 text-gray-600">this is already test uploaded files</p>
//             <p className="text-base mt-2 text-gray-600">
//               Go to <a href="/file/test12345" className="text-blue-600 hover:underline">/file/test/12345</a> to see download page (No Encryption)
//             </p>
//             <p className="text-base mt-2 text-gray-600">
//               Go to <a href="/file/test123" className="text-blue-600 hover:underline">/file/test/123</a> to see download page (No Encryption)
//             </p>
//             <p className="text-base mt-2 text-gray-600">
//               Go to <a href="/file/test123456" className="text-blue-600 hover:underline">/file/test/123456</a> to see download page (Encryption password: "hello")
//             </p>
//           </div>
//         } />
//         {/* Download page */}

//         <Route path="/file/:token" element={<DownloadPage />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;




// App.tsx - router + layout shell
// Pages are lazy-loaded: the first visit downloads only the page
// the user opened, not all ten pages. Big win for FCP and LCP.
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MobileNav from "./components/MobileNav";
import { Toaster } from "react-hot-toast";

const UploadPage = lazy(() => import("./pages/UploadPage"));
const DownloadPage = lazy(() => import("./pages/DownloadPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Layout><UploadPage /></Layout>} />
          <Route path="/file/:token" element={<Layout><DownloadPage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
          <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
          <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
          <Route path="/how" element={<Layout><HowItWorksPage /></Layout>} />
          <Route path="/cookies" element={<Layout><CookiePolicy /></Layout>} />
          <Route path="/feedback" element={<Layout><FeedbackPage /></Layout>} />
          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;