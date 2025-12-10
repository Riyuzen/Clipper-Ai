import OpenAI from "openai";
import fs from "fs";
import type { TranscriptSegment } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(audioPath: string): Promise<TranscriptSegment[]> {
  try {
    const audioReadStream = fs.createReadStream(audioPath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });
    
    const segments: TranscriptSegment[] = [];
    
    if (transcription.segments) {
      for (const segment of transcription.segments) {
        segments.push({
          start: segment.start,
          end: segment.end,
          text: segment.text.trim(),
        });
      }
    } else if (transcription.text) {
      segments.push({
        start: 0,
        end: transcription.duration || 60,
        text: transcription.text,
      });
    }
    
    return segments;
  } catch (error: any) {
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}
