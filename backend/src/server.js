// backend/server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();

// Allow the frontend (port 5173) to talk to the backend (port 3000)
app.use(cors());

// Configure Multer: Tell it WHERE to save the files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    // Save files to an "uploads" folder in our backend directory
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {

    // Keep the original file name
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Create the "uploads" folder if it doesn't exist
const fs = require("fs");
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// THE UPLOAD ROUTE
// upload.single("file") tells Multer to expect a file with the field name "file"
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  
  console.log("File saved to:", req.file.path);
  
  res.json({
    message: "File uploaded successfully!",
    fileName: req.file.filename,
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});