import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs-extra";

const execAsync = promisify(exec);

const UPLOADS_DIR = path.join(process.cwd(), "server/uploads");
const AUDIO_DIR = path.join(UPLOADS_DIR, "audio");

export async function extractAudio(videoPath: string, jobId: string): Promise<string> {
  await fs.ensureDir(AUDIO_DIR);
  
  const outputPath = path.join(AUDIO_DIR, `${jobId}.mp3`);
  
  try {
    const command = `ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -q:a 2 -y "${outputPath}"`;
    
    await execAsync(command, { timeout: 180000 });
    
    if (!await fs.pathExists(outputPath)) {
      throw new Error("Audio extraction failed - output file not found");
    }
    
    return outputPath;
  } catch (error: any) {
    throw new Error(`Failed to extract audio: ${error.message}`);
  }
}

export async function getVideoDuration(videoPath: string): Promise<number> {
  try {
    const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
    const { stdout } = await execAsync(command);
    return parseFloat(stdout.trim());
  } catch (error: any) {
    throw new Error(`Failed to get video duration: ${error.message}`);
  }
}
