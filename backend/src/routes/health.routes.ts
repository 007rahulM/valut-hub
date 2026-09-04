import {Router} from "express";
import { healthCheck,rootInfo } from "../controllers/health.controller";


const router = Router();

router.get("/health", healthCheck);
router.get("/",rootInfo);

export default router;