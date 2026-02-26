import { prisma } from "../utils/prisma.js";

export async function getAllVideos(req, res, next) {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: { select: { id: true, email: true, role: true } }
      }
    });
    res.json(videos);
  } catch (err) {
    next(err);
  }
}

export async function getAllItems(req, res, next) {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        video: { select: { id: true, title: true } },
        createdBy: { select: { id: true, email: true } }
      }
    });

    const annotations = await prisma.annotation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        video: { select: { id: true, title: true } },
        createdBy: { select: { id: true, email: true } }
      }
    });

    res.json({ bookmarks, annotations });
  } catch (err) {
    next(err);
  }
}