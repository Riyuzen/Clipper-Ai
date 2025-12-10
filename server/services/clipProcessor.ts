import { storage } from "../storage";
import { downloadVideo, processUploadedFile } from "./videoDownloader";
import { extractAudio, getVideoDuration } from "./audioExtractor";
import { transcribeAudio } from "./transcriber";
import { detectHighlights } from "./highlightDetector";
import { cutClips } from "./clipCutter";
import type { ClipJob } from "@shared/schema";
import fs from "fs-extra";

function sanitizeError(error: any): string {
  const message = error?.message || "An unexpected error occurred";
  
  const sensitivePatterns = [
    /\/home\/[^\/]+\//g,
    /\/Users\/[^\/]+\//g,
    /at\s+\S+\s+\([^)]+\)/g,
    /Error:\s*/g,
  ];
  
  let sanitized = message;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  if (sanitized.includes("yt-dlp")) {
    return "Failed to download video. Please check the URL is valid and publicly accessible.";
  }
  if (sanitized.includes("ffmpeg") || sanitized.includes("FFmpeg")) {
    return "Failed to process video file. The file may be corrupted or in an unsupported format.";
  }
  if (sanitized.includes("openai") || sanitized.includes("OpenAI") || sanitized.includes("API")) {
    return "Failed to transcribe audio. Please try again later.";
  }
  
  return sanitized.substring(0, 200);
}

export async function processClipJob(jobId: string): Promise<ClipJob> {
  try {
    const job = await storage.getClipJob(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    await storage.updateClipJob(jobId, { status: "downloading", progress: 5 });

    let videoPath: string;
    
    if (job.sourceType === "url" && job.sourceUrl) {
      videoPath = await downloadVideo(job.sourceUrl, jobId);
    } else if (job.videoPath && job.sourceFilename) {
      videoPath = await processUploadedFile(job.videoPath, job.sourceFilename, jobId);
    } else if (job.videoPath) {
      videoPath = await processUploadedFile(job.videoPath, "video.mp4", jobId);
    } else {
      throw new Error("No video source provided");
    }

    if (!await fs.pathExists(videoPath)) {
      throw new Error("Video file not found after download/upload");
    }

    await storage.updateClipJob(jobId, { 
      status: "extracting", 
      progress: 25,
      videoPath 
    });

    const [audioPath, videoDuration] = await Promise.all([
      extractAudio(videoPath, jobId),
      getVideoDuration(videoPath),
    ]);

    if (!await fs.pathExists(audioPath)) {
      throw new Error("Audio extraction failed");
    }

    await storage.updateClipJob(jobId, { 
      status: "transcribing", 
      progress: 45,
      audioPath 
    });

    const transcript = await transcribeAudio(audioPath);

    await storage.updateClipJob(jobId, { 
      status: "detecting", 
      progress: 65,
      transcript 
    });

    const highlights = detectHighlights(transcript, videoDuration);

    await storage.updateClipJob(jobId, { 
      status: "generating", 
      progress: 80 
    });

    const clips = await cutClips(videoPath, highlights, jobId);

    if (clips.length === 0) {
      throw new Error("No clips could be generated from the video");
    }

    const updatedJob = await storage.updateClipJob(jobId, { 
      status: "complete", 
      progress: 100,
      clips 
    });

    return updatedJob!;
  } catch (error: any) {
    const sanitizedError = sanitizeError(error);
    await storage.updateClipJob(jobId, { 
      status: "error", 
      error: sanitizedError 
    });
    throw new Error(sanitizedError);
  }
}
