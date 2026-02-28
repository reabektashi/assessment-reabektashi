import { prisma } from "../utils/prisma.js";

async function assertVideoExists(videoId) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true },
  });

  if (!video) return { ok: false, status: 404, message: "Video not found" };
  return { ok: true };
}

export async function addAnnotation(req, res, next) {
  try {
    const videoId = Number(req.params.videoId);
    const timestamp = Number(req.body?.timestamp);
    const description = req.body?.description?.trim();
    const dataJson = req.body?.dataJson;

    if (Number.isNaN(videoId)) return res.status(400).json({ message: "Invalid videoId" });
    if (Number.isNaN(timestamp)) return res.status(400).json({ message: "Timestamp is required" });
    if (!description) return res.status(400).json({ message: "Description is required" });
    if (dataJson === undefined) return res.status(400).json({ message: "dataJson is required" });

    const exists = await assertVideoExists(videoId);
    if (!exists.ok) return res.status(exists.status).json({ message: exists.message });

    const annotation = await prisma.annotation.create({
      data: { videoId, timestamp, description, dataJson, createdById: req.user.id },
    });

    return res.status(201).json(annotation);
  } catch (err) {
    next(err);
  }
}

export async function getAnnotations(req, res, next) {
  try {
    const videoId = Number(req.params.videoId);
    if (Number.isNaN(videoId)) return res.status(400).json({ message: "Invalid videoId" });

    const exists = await assertVideoExists(videoId);
    if (!exists.ok) return res.status(exists.status).json({ message: exists.message });

    const annotations = await prisma.annotation.findMany({
      where: { videoId },
      orderBy: { timestamp: "asc" },
    });

    return res.json(annotations);
  } catch (err) {
    next(err);
  }
}

export async function updateAnnotation(req, res, next) {
  try {
    const videoId = Number(req.params.videoId);
    const annotationId = Number(req.params.annotationId);

    const timestampRaw = req.body?.timestamp;
    const description = req.body?.description?.trim();
    const dataJson = req.body?.dataJson;

    if (Number.isNaN(videoId) || Number.isNaN(annotationId)) {
      return res.status(400).json({ message: "Invalid ids" });
    }
    if (timestampRaw === undefined && description === undefined && dataJson === undefined) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const exists = await assertVideoExists(videoId);
    if (!exists.ok) return res.status(exists.status).json({ message: exists.message });

    const existing = await prisma.annotation.findUnique({
      where: { id: annotationId },
      select: { id: true, videoId: true, createdById: true, dataJson: true },
    });
    if (!existing) return res.status(404).json({ message: "Annotation not found" });
    if (existing.videoId !== videoId) {
      return res.status(400).json({ message: "Annotation does not belong to this video" });
    }


    if (existing.createdById !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = {};
    if (timestampRaw !== undefined) {
      const timestamp = Number(timestampRaw);
      if (Number.isNaN(timestamp)) return res.status(400).json({ message: "Invalid timestamp" });
      data.timestamp = timestamp;
    }
    if (description !== undefined) {
      if (!description) return res.status(400).json({ message: "Description is required" });
      data.description = description;
    }
    if (dataJson !== undefined) data.dataJson = dataJson;

    const updated = await prisma.annotation.update({
      where: { id: annotationId },
      data,
    });

    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteAnnotation(req, res, next) {
  try {
    const videoId = Number(req.params.videoId);
    const annotationId = Number(req.params.annotationId);

    if (Number.isNaN(videoId) || Number.isNaN(annotationId)) {
      return res.status(400).json({ message: "Invalid ids" });
    }

    const exists = await assertVideoExists(videoId);
    if (!exists.ok) return res.status(exists.status).json({ message: exists.message });

    const existing = await prisma.annotation.findUnique({
      where: { id: annotationId },
      select: { id: true, videoId: true, createdById: true },
    });
    if (!existing) return res.status(404).json({ message: "Annotation not found" });
    if (existing.videoId !== videoId) {
      return res.status(400).json({ message: "Annotation does not belong to this video" });
    }


    if (existing.createdById !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.annotation.delete({ where: { id: annotationId } });
    return res.json({ message: "Annotation deleted" });
  } catch (err) {
    next(err);
  }
}