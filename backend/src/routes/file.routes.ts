import {Router} from "express";
import { getFileMetadata } from "../controllers/file.controller";

const router=Router();
router.get("/api/file/:token",getFileMetadata);

export default router; 