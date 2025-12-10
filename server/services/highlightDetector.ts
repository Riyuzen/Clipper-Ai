import type { TranscriptSegment } from "@shared/schema";

export interface HighlightMoment {
  startTime: number;
  endTime: number;
  score: number;
  reason: string;
}

const HIGHLIGHT_KEYWORDS = [
  "amazing", "incredible", "unbelievable", "wow", "awesome",
  "best", "worst", "important", "key", "critical",
  "breaking", "news", "announcement", "reveal", "surprise",
  "first", "last", "finally", "never", "always",
  "love", "hate", "excited", "shocking", "crazy",
  "win", "won", "winner", "champion", "victory",
  "fail", "failed", "mistake", "error", "wrong",
  "success", "successful", "achieved", "accomplished",
  "secret", "hidden", "exclusive", "special",
  "remember", "forget", "learn", "understand",
  "question", "answer", "solution", "problem",
];

const CLIP_DURATION = 30;
const MIN_CLIP_DURATION = 15;
const MAX_CLIPS = 5;

export function detectHighlights(
  segments: TranscriptSegment[],
  videoDuration: number
): HighlightMoment[] {
  if (segments.length === 0) {
    return generateDefaultHighlights(videoDuration);
  }

  const scoredSegments = segments.map((segment) => {
    let score = 0;
    const textLower = segment.text.toLowerCase();
    
    for (const keyword of HIGHLIGHT_KEYWORDS) {
      if (textLower.includes(keyword)) {
        score += 10;
      }
    }
    
    const exclamationCount = (segment.text.match(/!/g) || []).length;
    score += exclamationCount * 5;
    
    const questionCount = (segment.text.match(/\?/g) || []).length;
    score += questionCount * 3;
    
    const wordCount = segment.text.split(/\s+/).length;
    if (wordCount > 20) {
      score += 5;
    }
    
    return {
      segment,
      score,
    };
  });

  scoredSegments.sort((a, b) => b.score - a.score);

  const highlights: HighlightMoment[] = [];
  const usedTimeRanges: { start: number; end: number }[] = [];

  for (const { segment, score } of scoredSegments) {
    if (highlights.length >= MAX_CLIPS) break;

    const startTime = Math.max(0, segment.start - 5);
    const endTime = Math.min(videoDuration, segment.start + CLIP_DURATION - 5);
    const duration = endTime - startTime;

    if (duration < MIN_CLIP_DURATION) continue;

    const overlaps = usedTimeRanges.some(
      (range) => !(endTime <= range.start || startTime >= range.end)
    );

    if (overlaps) continue;

    highlights.push({
      startTime,
      endTime,
      score,
      reason: `Contains engaging content`,
    });

    usedTimeRanges.push({ start: startTime, end: endTime });
  }

  if (highlights.length === 0) {
    return generateDefaultHighlights(videoDuration);
  }

  highlights.sort((a, b) => a.startTime - b.startTime);

  return highlights;
}

function generateDefaultHighlights(videoDuration: number): HighlightMoment[] {
  const highlights: HighlightMoment[] = [];
  const numClips = Math.min(MAX_CLIPS, Math.floor(videoDuration / CLIP_DURATION));

  if (numClips === 0 && videoDuration >= MIN_CLIP_DURATION) {
    highlights.push({
      startTime: 0,
      endTime: Math.min(videoDuration, CLIP_DURATION),
      score: 1,
      reason: "Video segment",
    });
    return highlights;
  }

  const interval = videoDuration / (numClips + 1);

  for (let i = 1; i <= numClips; i++) {
    const centerTime = interval * i;
    const startTime = Math.max(0, centerTime - CLIP_DURATION / 2);
    const endTime = Math.min(videoDuration, startTime + CLIP_DURATION);

    highlights.push({
      startTime,
      endTime,
      score: numClips - i + 1,
      reason: `Segment ${i} of ${numClips}`,
    });
  }

  return highlights;
}
