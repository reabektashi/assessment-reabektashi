import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  addAnnotation,
  getAnnotations,
  updateAnnotation,
  deleteAnnotation,
} from "../controllers/annotation.controller.js";

const router = express.Router();

router.post("/videos/:videoId/annotations", requireAuth, addAnnotation);
router.get("/videos/:videoId/annotations", requireAuth, getAnnotations);
router.patch("/videos/:videoId/annotations/:annotationId", requireAuth, updateAnnotation);
router.delete("/videos/:videoId/annotations/:annotationId", requireAuth, deleteAnnotation);

export default router;