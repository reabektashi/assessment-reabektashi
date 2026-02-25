import { prisma } from "../utils/prisma.js";

export async function uploadVideo(req, res, next) {
  try {
    const title = req.body?.title?.trim();

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Video file is required" });
    }

    const video = await prisma.video.create({
      data: {
        title,
        filePath: req.file.filename,
        uploadedById: req.user.id
      }
    });

    return res.status(201).json(video);
  } catch (err) {
    return next(err);
  }
}

export async function getVideos(req, res, next) {
  try {
    const videos = await prisma.video.findMany({
      where: { uploadedById: req.user.id },
      orderBy: { createdAt: "desc" }
    });

    return res.json(videos);
  } catch (err) {
    return next(err);
  }
}