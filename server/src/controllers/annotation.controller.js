import { prisma } from "../utils/prisma.js";

export async function addAnnotation(req, res, next) {
  try {
    const videoId = Number(req.params.videoId);
    const timestamp = Number(req.body?.timestamp);
    const description = req.body?.description?.trim();
    const dataJson = req.body?.dataJson;

    if (!videoId || Number.isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid videoId" });
    }
    if (Number.isNaN(timestamp)) {
      return res.status(400).json({ message: "Timestamp is required" });
    }
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }
    if (dataJson === undefined) {
      return res.status(400).json({ message: "dataJson is required" });
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { uploadedById: true }
    });
    if (!video) return res.status(404).json({ message: "Video not found" });
    if (video.uploadedById !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const annotation = await prisma.annotation.create({
      data: {
        videoId,
        timestamp,
        description,
        dataJson,
        createdById: req.user.id
      }
    });

    return res.status(201).json(annotation);
  } catch (err) {
    next(err);
  }
}

export async function getAnnotations(req, res, next) {
  try {
    const videoId = Number(req.params.videoId);
    if (!videoId || Number.isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid videoId" });
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { uploadedById: true }
    });
    if (!video) return res.status(404).json({ message: "Video not found" });
    if (video.uploadedById !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const annotations = await prisma.annotation.findMany({
      where: { videoId },
      orderBy: { timestamp: "asc" }
    });

    return res.json(annotations);
  } catch (err) {
    next(err);
  }
}