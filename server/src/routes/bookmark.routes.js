import { prisma } from "../utils/prisma.js";

async function assertVideoOwner(videoId, userId) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { uploadedById: true },
  });

  if (!video) return { ok: false, status: 404, message: "Video not found" };
  if (video.uploadedById !== userId)
    return { ok: false, status: 403, message: "Forbidden" };

  return { ok: true };
}

export async function addBookmark(req, res, next) {
  try {
    const videoId = Number(req.params.videoId);
    const title = req.body?.title?.trim();
    const timestamp = Number(req.body?.timestamp);

    if (Number.isNaN(videoId)) return res.status(400).json({ message: "Invalid videoId" });
    if (!title) return res.status(400).json({ message: "Title is required" });
    if (Number.isNaN(timestamp)) return res.status(400).json({ message: "Timestamp is required" });

    const ownership = await assertVideoOwner(videoId, req.user.id);
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const bookmark = await prisma.bookmark.create({
      data: { title, timestamp, videoId, createdById: req.user.id },
    });

    return res.status(201).json(bookmark);
  } catch (err) {
    next(err);
  }
}

export async function getBookmarks(req, res, next) {
  try {
    const videoId = Number(req.params.videoId);
    if (Number.isNaN(videoId)) return res.status(400).json({ message: "Invalid videoId" });

    const ownership = await assertVideoOwner(videoId, req.user.id);
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const bookmarks = await prisma.bookmark.findMany({
      where: { videoId },
      orderBy: { timestamp: "asc" },
    });

    return res.json(bookmarks);
  } catch (err) {
    next(err);
  }
}

export async function updateBookmark(req, res, next) {
  try {
    const videoId = Number(req.params.videoId);
    const bookmarkId = Number(req.params.bookmarkId);

    const title = req.body?.title?.trim();
    const timestampRaw = req.body?.timestamp;

    if (Number.isNaN(videoId) || Number.isNaN(bookmarkId)) {
      return res.status(400).json({ message: "Invalid ids" });
    }
    if (title === undefined && timestampRaw === undefined) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const ownership = await assertVideoOwner(videoId, req.user.id);
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const existing = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
      select: { id: true, videoId: true },
    });
    if (!existing) return res.status(404).json({ message: "Bookmark not found" });
    if (existing.videoId !== videoId) {
      return res.status(400).json({ message: "Bookmark does not belong to this video" });
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (timestampRaw !== undefined) {
      const timestamp = Number(timestampRaw);
      if (Number.isNaN(timestamp)) return res.status(400).json({ message: "Invalid timestamp" });
      data.timestamp = timestamp;
    }

    const updated = await prisma.bookmark.update({
      where: { id: bookmarkId },
      data,
    });

    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteBookmark(req, res, next) {
  try {
    const videoId = Number(req.params.videoId);
    const bookmarkId = Number(req.params.bookmarkId);

    if (Number.isNaN(videoId) || Number.isNaN(bookmarkId)) {
      return res.status(400).json({ message: "Invalid ids" });
    }

    const ownership = await assertVideoOwner(videoId, req.user.id);
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const existing = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
      select: { id: true, videoId: true },
    });
    if (!existing) return res.status(404).json({ message: "Bookmark not found" });
    if (existing.videoId !== videoId) {
      return res.status(400).json({ message: "Bookmark does not belong to this video" });
    }

    await prisma.bookmark.delete({ where: { id: bookmarkId } });
    return res.json({ message: "Bookmark deleted" });
  } catch (err) {
    next(err);
  }
}