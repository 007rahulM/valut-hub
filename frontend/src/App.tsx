
// // // // App.tsx - router + layout shell
// // // // Pages are lazy-loaded: the first visit downloads only the page
// // // // the user opened, not all ten pages. Big win for FCP and LCP.
// // // import { lazy, Suspense } from "react";
// // // import { BrowserRouter, Route, Routes } from "react-router-dom";
// // // import Header from "./components/Header";
// // // import Footer from "./components/Footer";
// // // import MobileNav from "./components/MobileNav";
// // // import { Toaster } from "react-hot-toast";

// // // const UploadPage = lazy(() => import("./pages/UploadPage"));
// // // const DownloadPage = lazy(() => import("./pages/DownloadPage"));
// // // const AboutPage = lazy(() => import("./pages/AboutPage"));
// // // const TermsPage = lazy(() => import("./pages/TermsPage"));
// // // const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
// // // const FAQPage = lazy(() => import("./pages/FAQPage"));
// // // const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
// // // const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
// // // const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
// // // const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// // // function Layout({ children }: { children: React.ReactNode }) {
// // //   return (
// // //     <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
// // //       <Header />
// // //       <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
// // //         {children}
// // //       </main>
// // //       <Footer />
// // //       <MobileNav />
// // //       <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
// // //     </div>
// // //   );
// // // }

// // // function App() {
// // //   return (
// // //     <BrowserRouter>
// // //       <Suspense fallback={null}>
// // //         <Routes>
// // //           <Route path="/" element={<Layout><UploadPage /></Layout>} />
// // //           <Route path="/file/:token" element={<Layout><DownloadPage /></Layout>} />
// // //           <Route path="/about" element={<Layout><AboutPage /></Layout>} />
// // //           <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
// // //           <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
// // //           <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
// // //           <Route path="/how" element={<Layout><HowItWorksPage /></Layout>} />
// // //           <Route path="/cookies" element={<Layout><CookiePolicy /></Layout>} />
// // //           <Route path="/feedback" element={<Layout><FeedbackPage /></Layout>} />
// // //           <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
// // //         </Routes>
// // //       </Suspense>
// // //     </BrowserRouter>
// // //   );
// // // }

// // // export default App;


// // import { lazy, Suspense } from "react";
// // import { BrowserRouter, Route, Routes } from "react-router-dom";
// // import Header from "./components/Header";
// // import Footer from "./components/Footer";
// // import MobileNav from "./components/MobileNav";
// // import { Toaster } from "react-hot-toast";

// // const UploadPage = lazy(() => import("./pages/UploadPage"));
// // const DownloadPage = lazy(() => import("./pages/DownloadPage"));
// // const AboutPage = lazy(() => import("./pages/AboutPage"));
// // const TermsPage = lazy(() => import("./pages/TermsPage"));
// // const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
// // const FAQPage = lazy(() => import("./pages/FAQPage"));
// // const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
// // const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
// // const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
// // const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
// // const MultipartV2UploadTestPage = lazy(
// //   () => import("./pages/MultipartV2UploadTestPage"),
// // );

// // import { InstallPrompt } from "./components/InstallPrompt";

// // function Layout({ children }: { children: React.ReactNode }) {
// //   return (
// //     <div className="min-h-screen flex flex-col">
// //       <Header />
// //       <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
// //         {children}
// //       </main>
// //       <Footer />
// //       <MobileNav />
// //       <InstallPrompt />
// //       <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
// //     </div>
// //   );
// // }

// // function App() {
// //   return (
// //     <BrowserRouter>
// //       <Suspense fallback={null}>
// //         <Routes>
// //           <Route path="/" element={<Layout><UploadPage /></Layout>} />
// //           <Route path="/file/:token" element={<Layout><DownloadPage /></Layout>} />
// //           <Route path="/about" element={<Layout><AboutPage /></Layout>} />
// //           <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
// //           <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
// //           <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
// //           <Route path="/how" element={<Layout><HowItWorksPage /></Layout>} />
// //           <Route path="/cookies" element={<Layout><CookiePolicy /></Layout>} />
// //           <Route path="/feedback" element={<Layout><FeedbackPage /></Layout>} />
// //           <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
// //           {import.meta.env.DEV && (
// //  <Route
// //   path="/dev/multipart-v2-upload"
// //   element={<Layout><MultipartV2UploadTestPage /></Layout>}
// // />

// // )}

// //         </Routes>
// //       </Suspense>
// //     </BrowserRouter>
// //   );
// // }

// // export default App;




// // // App.tsx - router + layout shell
// // // Pages are lazy-loaded: the first visit downloads only the page
// // // the user opened, not all ten pages. Big win for FCP and LCP.
// // import { lazy, Suspense } from "react";
// // import { BrowserRouter, Route, Routes } from "react-router-dom";
// // import Header from "./components/Header";
// // import Footer from "./components/Footer";
// // import MobileNav from "./components/MobileNav";
// // import { Toaster } from "react-hot-toast";

// // const UploadPage = lazy(() => import("./pages/UploadPage"));
// // const DownloadPage = lazy(() => import("./pages/DownloadPage"));
// // const AboutPage = lazy(() => import("./pages/AboutPage"));
// // const TermsPage = lazy(() => import("./pages/TermsPage"));
// // const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
// // const FAQPage = lazy(() => import("./pages/FAQPage"));
// // const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
// // const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
// // const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
// // const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// // function Layout({ children }: { children: React.ReactNode }) {
// //   return (
// //     <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
// //       <Header />
// //       <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
// //         {children}
// //       </main>
// //       <Footer />
// //       <MobileNav />
// //       <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
// //     </div>
// //   );
// // }

// // function App() {
// //   return (
// //     <BrowserRouter>
// //       <Suspense fallback={null}>
// //         <Routes>
// //           <Route path="/" element={<Layout><UploadPage /></Layout>} />
// //           <Route path="/file/:token" element={<Layout><DownloadPage /></Layout>} />
// //           <Route path="/about" element={<Layout><AboutPage /></Layout>} />
// //           <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
// //           <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
// //           <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
// //           <Route path="/how" element={<Layout><HowItWorksPage /></Layout>} />
// //           <Route path="/cookies" element={<Layout><CookiePolicy /></Layout>} />
// //           <Route path="/feedback" element={<Layout><FeedbackPage /></Layout>} />
// //           <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
// //         </Routes>
// //       </Suspense>
// //     </BrowserRouter>
// //   );
// // }

// // export default App;


// import { lazy, Suspense } from "react";
// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import Header from "./components/Header";
// import Footer from "./components/Footer";
// import MobileNav from "./components/MobileNav";
// import { Toaster } from "react-hot-toast";

// //const UploadPage = lazy(() => import("./pages/UploadPage"));
// const DownloadPage = lazy(() => import("./pages/DownloadPage"));
// const AboutPage = lazy(() => import("./pages/AboutPage"));
// const TermsPage = lazy(() => import("./pages/TermsPage"));
// const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
// const FAQPage = lazy(() => import("./pages/FAQPage"));
// const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
// const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
// const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
// const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
// const MultipartV2EngineTestPage = lazy(
//   () => import("./pages/MultipartV2UploadTestPage"),
// );
// const MultipartV2UploadTestPage = lazy(
//   () => import("./pages/MultipartV2UploadTestPage"),
// );
// const SendlyLearningLabV2 = lazy(
//   () => import("./pages/SendlyLearningLabV2"),
// );
// const UploadPageV2 = lazy(() => import("./pages/UploadPage.v2"));
// const DownloadPageV2 = lazy(() => import("./pages/DownloadPage.v2"));

// import { InstallPrompt } from "./components/InstallPrompt";

// function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />
//       <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
//         {children}
//       </main>
//       <Footer />
//       <MobileNav />
//       <InstallPrompt />
//       <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
//     </div>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Suspense fallback={null}>
//         <Routes>
//           {/* <Route path="/" element={<Layout><UploadPage /></Layout>} /> */}
//           <Route path="/file/:token" element={<Layout><DownloadPage /></Layout>} />
//           <Route path="/about" element={<Layout><AboutPage /></Layout>} />
//           <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
//           <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
//           <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
//           <Route path="/how" element={<Layout><HowItWorksPage /></Layout>} />
//           <Route path="/cookies" element={<Layout><CookiePolicy /></Layout>} />
//           <Route path="/feedback" element={<Layout><FeedbackPage /></Layout>} />
//           <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
//           {import.meta.env.DEV && (
//             <>

//   <Route
//                 path="/dev/multipart-v2-engine"
//                 element={<Layout><MultipartV2EngineTestPage /></Layout>}
//               />
//               <Route
//                 path="/dev/multipart-v2-upload"
//                 element={<Layout><MultipartV2UploadTestPage /></Layout>}
//               />
//               <Route
//                 path="/dev/sendly-learning-v2"
//                 element={<Layout><SendlyLearningLabV2 /></Layout>}
//               />
//               <Route
//                 path="/"
//                 element={<Layout><UploadPageV2 /></Layout>}
//               />
//               <Route
//                 path="/dev/download-v2/:token"
//                 element={<Layout><DownloadPageV2 /></Layout>}
//               />
//             </>
//           )}

//         </Routes>
//       </Suspense>
//     </BrowserRouter>
//   );
// }

// export default App;




import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MobileNav from "./components/MobileNav";
import { Toaster } from "react-hot-toast";

//const UploadPage = lazy(() => import("./pages/UploadPage"));
//const DownloadPage = lazy(() => import("./pages/DownloadPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const DownloadPage = lazy(() => import("./pages/DownloadPage.v2"));
import DeepDivePage from "./pages/DeepDivePage";
// const MultipartV2EngineTestPage = lazy(
//   () => import("./pages/MultipartV2UploadTestPage"),
// );
// const MultipartV2UploadTestPage = lazy(
//   () => import("./pages/MultipartV2UploadTestPage"),
// );
// const SendlyLearningLabV2 = lazy(
//   () => import("./pages/SendlyLearningLabV2"),
// );
const UploadPageV2 = lazy(() => import("./pages/UploadPage.v2"));
// const DownloadPageV2 = lazy(() => import("./pages/DownloadPage.v2"));

import { InstallPrompt } from "./components/InstallPrompt";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <InstallPrompt />
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          {/* <Route path="/" element={<Layout><UploadPage /></Layout>} /> */}
          <Route path="/file/:token" element={<Layout><DownloadPage /></Layout>} />
          <Route path="/deep-dive" element={<DeepDivePage />} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
          <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
          <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
          <Route path="/how" element={<Layout><HowItWorksPage /></Layout>} />
          <Route path="/cookies" element={<Layout><CookiePolicy /></Layout>} />
          <Route path="/feedback" element={<Layout><FeedbackPage /></Layout>} />
          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
          
          {/* DEV-ONLY ROUTES - Commented out for production */}
          {/* 
          {import.meta.env.DEV && (
            <>
              <Route
                path="/dev/multipart-v2-engine"
                element={<Layout><MultipartV2EngineTestPage /></Layout>}
              />
              <Route
                path="/dev/multipart-v2-upload"
                element={<Layout><MultipartV2UploadTestPage /></Layout>}
              />
              <Route
                path="/dev/sendly-learning-v2"
                element={<Layout><SendlyLearningLabV2 /></Layout>}
              />
              <Route
                path="/"
                element={<Layout><UploadPageV2 /></Layout>}
              />
              <Route
                path="/dev/download-v2/:token"
                element={<Layout><DownloadPageV2 /></Layout>}
              />
            </>
          )}
          */}
          
          {/* Production route for UploadPageV2 */}
          <Route path="/" element={<Layout><UploadPageV2 /></Layout>} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;