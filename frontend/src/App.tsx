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


        {/* Download page */}

        <Route path="/file/:token" element={<DownloadPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;