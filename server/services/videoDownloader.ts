import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs-extra";

const execAsync = promisify(exec);

const UPLOADS_DIR = path.join(process.cwd(), "server/uploads");
const VIDEOS_DIR = path.join(UPLOADS_DIR, "videos");

export async function downloadVideo(url: string, jobId: string): Promise<string> {
  await fs.ensureDir(VIDEOS_DIR);
  
  const outputPath = path.join(VIDEOS_DIR, `${jobId}.mp4`);
  
  try {
    const command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${outputPath}" "${url}"`;
    
    await execAsync(command, { timeout: 300000 });
    
    if (!await fs.pathExists(outputPath)) {
      throw new Error("Video download failed - output file not found");
    }
    
    return outputPath;
  } catch (error: any) {
    throw new Error(`Failed to download video: ${error.message}`);
  }
}

export async function getVideoFromUpload(filePath: string, jobId: string): Promise<string> {
  await fs.ensureDir(VIDEOS_DIR);
  
  const ext = path.extname(filePath);
  const outputPath = path.join(VIDEOS_DIR, `${jobId}${ext}`);
  
  await fs.copy(filePath, outputPath);
  
  return outputPath;
}
