import { storage } from "../storage";
import { downloadVideo, getVideoFromUpload } from "./videoDownloader";
import { extractAudio, getVideoDuration } from "./audioExtractor";
import { transcribeAudio } from "./transcriber";
import { detectHighlights } from "./highlightDetector";
import { cutClips } from "./clipCutter";
import type { ClipJob } from "@shared/schema";

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
    } else if (job.videoPath) {
      videoPath = job.videoPath;
    } else {
      throw new Error("No video source provided");
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

    const updatedJob = await storage.updateClipJob(jobId, { 
      status: "complete", 
      progress: 100,
      clips 
    });

    return updatedJob!;
  } catch (error: any) {
    await storage.updateClipJob(jobId, { 
      status: "error", 
      error: error.message 
    });
    throw error;
  }
}
