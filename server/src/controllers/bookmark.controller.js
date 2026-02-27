import { prisma } from "../utils/prisma.js";

export async function addBookmark(req, res, next) {
  try {
    const videoId = Number(req.params.videoId);
    const title = req.body?.title?.trim();
    const timestamp = Number(req.body?.timestamp);

    if (!videoId || Number.isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid videoId" });
    }
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (Number.isNaN(timestamp)) {
      return res.status(400).json({ message: "Timestamp is required" });
    }

    // ownership 
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { uploadedById: true }
    });

    if (!video) return res.status(404).json({ message: "Video not found" });
    if (video.uploadedById !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        title,
        timestamp,
        videoId,
        createdById: req.user.id
      }
    });

    return res.status(201).json(bookmark);
  } catch (err) {
    next(err);
  }
}

export async function getBookmarks(req, res, next) {
  try {
    const videoId = Number(req.params.videoId);

    if (!videoId || Number.isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid videoId" });
    }

    // ownership 
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { uploadedById: true }
    });

    if (!video) return res.status(404).json({ message: "Video not found" });
    if (video.uploadedById !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { videoId },
      orderBy: { timestamp: "asc" }
    });

    return res.json(bookmarks);
  } catch (err) {
    next(err);
  }
}