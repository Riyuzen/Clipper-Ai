import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { storage } from "./storage";
import { processClipJob } from "./services/clipProcessor";
import { getClipPath } from "./services/clipCutter";
import { insertClipJobSchema } from "@shared/schema";

const UPLOADS_DIR = path.join(process.cwd(), "server/uploads");
const VIDEOS_DIR = path.join(UPLOADS_DIR, "videos");

const upload = multer({
  dest: VIDEOS_DIR,
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only video files are allowed."));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await fs.ensureDir(VIDEOS_DIR);

  app.post("/api/clip", upload.single("video"), async (req, res) => {
    try {
      let jobData;

      if (req.file) {
        jobData = {
          sourceType: "file" as const,
          sourceFilename: req.file.originalname,
        };
      } else if (req.body.url) {
        const validation = insertClipJobSchema.safeParse({
          sourceType: "url",
          sourceUrl: req.body.url,
        });

        if (!validation.success) {
          return res.status(400).json({ error: "Invalid URL provided" });
        }

        jobData = validation.data;
      } else {
        return res.status(400).json({ error: "No video URL or file provided" });
      }

      const job = await storage.createClipJob(jobData);

      if (req.file) {
        await storage.updateClipJob(job.id, {
          videoPath: req.file.path,
          sourceFilename: req.file.originalname,
        });
      }

      processClipJob(job.id).catch((error) => {
        console.error(`Job ${job.id} failed:`, error.message);
      });

      res.json({ jobId: job.id });
    } catch (error: any) {
      console.error("Error creating clip job:", error);
      res.status(500).json({ error: "Failed to create clip job. Please try again." });
    }
  });

  app.get("/api/clip/:jobId", async (req, res) => {
    try {
      const job = await storage.getClipJob(req.params.jobId);

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json({
        id: job.id,
        status: job.status,
        progress: job.progress,
        clips: job.clips.map((clip) => ({
          id: clip.id,
          filename: clip.filename,
          startTime: clip.startTime,
          endTime: clip.endTime,
          duration: clip.duration,
          url: `/api/result/${job.id}/${clip.id}`,
        })),
        error: job.error,
      });
    } catch (error: any) {
      console.error("Error getting job:", error);
      res.status(500).json({ error: "Failed to retrieve job status" });
    }
  });

  app.get("/api/result/:jobId/:clipId", async (req, res) => {
    try {
      const { jobId, clipId } = req.params;

      const clip = await storage.getClip(jobId, clipId);

      if (!clip) {
        return res.status(404).json({ error: "Clip not found" });
      }

      const clipPath = await getClipPath(jobId, clip.filename);

      if (!clipPath) {
        return res.status(404).json({ error: "Clip file not found" });
      }

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", `attachment; filename="${clip.filename}"`);

      const stream = fs.createReadStream(clipPath);
      stream.pipe(res);
    } catch (error: any) {
      console.error("Error serving clip:", error);
      res.status(500).json({ error: "Failed to download clip" });
    }
  });

  app.get("/api/stream/:jobId/:clipId", async (req, res) => {
    try {
      const { jobId, clipId } = req.params;

      const clip = await storage.getClip(jobId, clipId);

      if (!clip) {
        return res.status(404).json({ error: "Clip not found" });
      }

      const clipPath = await getClipPath(jobId, clip.filename);

      if (!clipPath) {
        return res.status(404).json({ error: "Clip file not found" });
      }

      const stat = await fs.stat(clipPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": "video/mp4",
        });

        const stream = fs.createReadStream(clipPath, { start, end });
        stream.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        });

        const stream = fs.createReadStream(clipPath);
        stream.pipe(res);
      }
    } catch (error: any) {
      console.error("Error streaming clip:", error);
      res.status(500).json({ error: "Failed to stream clip" });
    }
  });

  return httpServer;
}
