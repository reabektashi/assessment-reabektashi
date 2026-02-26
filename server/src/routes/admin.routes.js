import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { getAllVideos, getAllItems } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/admin/videos", requireAuth, requireAdmin, getAllVideos);
router.get("/admin/items", requireAuth, requireAdmin, getAllItems);

export default router;