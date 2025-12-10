import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs-extra";
import { randomUUID } from "crypto";
import type { Clip } from "@shared/schema";
import type { HighlightMoment } from "./highlightDetector";

const execAsync = promisify(exec);

const UPLOADS_DIR = path.join(process.cwd(), "server/uploads");
const CLIPS_DIR = path.join(UPLOADS_DIR, "clips");

export async function cutClips(
  videoPath: string,
  highlights: HighlightMoment[],
  jobId: string
): Promise<Clip[]> {
  await fs.ensureDir(CLIPS_DIR);
  
  const jobClipsDir = path.join(CLIPS_DIR, jobId);
  await fs.ensureDir(jobClipsDir);

  const clips: Clip[] = [];

  for (let i = 0; i < highlights.length; i++) {
    const highlight = highlights[i];
    const clipId = randomUUID();
    const filename = `clip_${String(i + 1).padStart(3, "0")}.mp4`;
    const outputPath = path.join(jobClipsDir, filename);

    try {
      const duration = highlight.endTime - highlight.startTime;
      
      const command = `ffmpeg -i "${videoPath}" -ss ${highlight.startTime} -t ${duration} -c:v libx264 -c:a aac -y "${outputPath}"`;
      
      await execAsync(command, { timeout: 120000 });

      if (await fs.pathExists(outputPath)) {
        clips.push({
          id: clipId,
          filename,
          startTime: highlight.startTime,
          endTime: highlight.endTime,
          duration,
          filepath: outputPath,
        });
      }
    } catch (error: any) {
      console.error(`Failed to cut clip ${i + 1}: ${error.message}`);
    }
  }

  return clips;
}

export async function getClipPath(jobId: string, filename: string): Promise<string | null> {
  const clipPath = path.join(CLIPS_DIR, jobId, filename);
  
  if (await fs.pathExists(clipPath)) {
    return clipPath;
  }
  
  return null;
}
