import { prisma } from "../utils/prisma.js";

async function assertVideoExists(videoId) {
  const video = await prisma.video.findUnique({ where: { id: Number(videoId) } });
  if (!video) {
    const err = new Error("Video not found");
    err.status = 404;
    throw err;
  }
  return video;
}

export async function addBookmark(req, res, next) {
  try {
    const { videoId } = req.params;
    const title = req.body?.title?.trim();
    const timestamp = Number(req.body?.timestamp);

    if (!title) return res.status(400).json({ message: "Title is required" });
    if (Number.isNaN(timestamp)) return res.status(400).json({ message: "Valid timestamp is required" });

    await assertVideoExists(videoId);

    const bookmark = await prisma.bookmark.create({
      data: {
        title,
        timestamp,
        videoId: Number(videoId),
        createdById: req.user.id
      }
    });

    res.status(201).json(bookmark);
  } catch (err) {
    next(err);
  }
}

export async function getBookmarks(req, res, next) {
  try {
    const { videoId } = req.params;
    await assertVideoExists(videoId);

    const bookmarks = await prisma.bookmark.findMany({
      where: { videoId: Number(videoId) },
      orderBy: { timestamp: "asc" }
    });

    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
}

export async function updateBookmark(req, res, next) {
  try {
    const { videoId, bookmarkId } = req.params;
    const title = req.body?.title?.trim();
    const timestamp = Number(req.body?.timestamp);

    await assertVideoExists(videoId);

 
    const existing = await prisma.bookmark.findUnique({ where: { id: Number(bookmarkId) } });
    if (!existing || existing.videoId !== Number(videoId)) return res.status(404).json({ message: "Bookmark not found" });
    if (existing.createdById !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    const updated = await prisma.bookmark.update({
      where: { id: Number(bookmarkId) },
      data: {
        ...(title ? { title } : {}),
        ...(Number.isNaN(timestamp) ? {} : { timestamp })
      }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteBookmark(req, res, next) {
  try {
    const { videoId, bookmarkId } = req.params;

    await assertVideoExists(videoId);

    
    const existing = await prisma.bookmark.findUnique({ where: { id: Number(bookmarkId) } });
    if (!existing || existing.videoId !== Number(videoId)) return res.status(404).json({ message: "Bookmark not found" });
    if (existing.createdById !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    await prisma.bookmark.delete({ where: { id: Number(bookmarkId) } });
    res.json({ message: "Bookmark deleted" });
  } catch (err) {
    next(err);
  }
}