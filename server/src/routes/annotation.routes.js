import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { addAnnotation, getAnnotations } from "../controllers/annotation.controller.js";

const router = express.Router();

router.post("/videos/:videoId/annotations", requireAuth, addAnnotation);
router.get("/videos/:videoId/annotations", requireAuth, getAnnotations);

export default router;