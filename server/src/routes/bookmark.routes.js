import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { addBookmark, getBookmarks } from "../controllers/bookmark.controller.js";

const router = express.Router();

// POST /videos/:videoId/bookmarks
router.post("/videos/:videoId/bookmarks", requireAuth, addBookmark);

// GET /videos/:videoId/bookmarks
router.get("/videos/:videoId/bookmarks", requireAuth, getBookmarks);

export default router;