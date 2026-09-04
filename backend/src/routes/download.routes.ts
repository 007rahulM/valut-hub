import { Router } from "express";
import { enforceDownloadSecurity } from "../middleware/enforceDownloadSecurity";
import { processDownload ,confirmDownload} from "../controllers/download.controller";

import rateLimit from "express-rate-limit";

// The Bouncer: Max 5 download attempts per minute per IP
// This stops hackers from brute-forcing passwords and crashing your DB
const downloadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many attempts. Please wait a minute." }
  },
  standardHeaders: true,
  legacyHeaders: false,
});


const router=Router();

//POST /api/download:token -> hand it to the download controller
router.post("/api/download/:token", enforceDownloadSecurity, processDownload);


// FIX: Add the confirmation route
router.post("/api/download/:token/confirm", confirmDownload);


export default router;