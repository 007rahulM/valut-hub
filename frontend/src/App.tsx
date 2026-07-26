import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DownloadPage } from "./pages/DownloadPage"; 
import {Header} from "./components/Header";
import UploadPage from "./pages/UploadPage";

function App() {
  return (
    <BrowserRouter>
    <Header/>  {/*header is shown in every page because this is in outside of the routes */}
      <Routes>
      {/* Home page - Upload page */}

  
        <Route path="/" element={<UploadPage />} />

       { /* upload route for me  */}
         {/* Test links page */}
        <Route path="/upload" element={
          <div className="p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Vault Hub</h1>
            <p className="text-base mt-2 text-gray-600">this is already test uploaded files</p>
            <p className="text-base mt-2 text-gray-600">
              Go to <a href="/file/test12345" className="text-blue-600 hover:underline">/file/test/12345</a> to see download page (No Encryption)
            </p>
            <p className="text-base mt-2 text-gray-600">
              Go to <a href="/file/test123" className="text-blue-600 hover:underline">/file/test/123</a> to see download page (No Encryption)
            </p>
            <p className="text-base mt-2 text-gray-600">
              Go to <a href="/file/test123456" className="text-blue-600 hover:underline">/file/test/123456</a> to see download page (Encryption password: "hello")
            </p>
          </div>
        } />
        {/* Download page */}

        <Route path="/file/:token" element={<DownloadPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;