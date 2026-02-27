import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  addBookmark,
  getBookmarks,
  updateBookmark,
  deleteBookmark,
} from "../controllers/bookmark.controller.js";

const router = express.Router();

router.post("/videos/:videoId/bookmarks", requireAuth, addBookmark);
router.get("/videos/:videoId/bookmarks", requireAuth, getBookmarks);
router.patch("/videos/:videoId/bookmarks/:bookmarkId", requireAuth, updateBookmark);
router.delete("/videos/:videoId/bookmarks/:bookmarkId", requireAuth, deleteBookmark);

export default router;