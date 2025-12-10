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
    
    const files = await fs.readdir(VIDEOS_DIR);
    const matchingFile = files.find(f => f.startsWith(jobId) && (f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.mkv')));
    
    if (matchingFile) {
      const actualPath = path.join(VIDEOS_DIR, matchingFile);
      if (actualPath !== outputPath && await fs.pathExists(actualPath)) {
        await fs.move(actualPath, outputPath, { overwrite: true });
      }
    }
    
    if (!await fs.pathExists(outputPath)) {
      throw new Error("Video download failed - output file not found");
    }
    
    return outputPath;
  } catch (error: any) {
    throw new Error(`Failed to download video: ${error.message}`);
  }
}

export async function processUploadedFile(tempPath: string, originalName: string, jobId: string): Promise<string> {
  await fs.ensureDir(VIDEOS_DIR);
  
  const ext = path.extname(originalName) || '.mp4';
  const outputPath = path.join(VIDEOS_DIR, `${jobId}${ext}`);
  
  if (!await fs.pathExists(tempPath)) {
    throw new Error("Uploaded file not found");
  }
  
  await fs.copy(tempPath, outputPath);
  
  try {
    await fs.unlink(tempPath);
  } catch {
  }
  
  return outputPath;
}
