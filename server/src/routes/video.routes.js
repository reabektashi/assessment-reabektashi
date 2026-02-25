import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.middleware.js";
import { uploadVideo, getVideos } from "../controllers/video.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) return cb(null, true);
    cb(new Error("Only video files are allowed"));
  }
});

router.post("/", requireAuth, upload.single("video"), uploadVideo);
router.get("/", requireAuth, getVideos);

export default router;