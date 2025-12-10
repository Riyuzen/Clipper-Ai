import { apiRequest } from "./queryClient";

export interface ClipApiResponse {
  id: string;
  filename: string;
  startTime: number;
  endTime: number;
  duration: number;
  url: string;
}

export interface JobStatusResponse {
  id: string;
  status: "pending" | "downloading" | "extracting" | "transcribing" | "detecting" | "generating" | "complete" | "error";
  progress: number;
  clips: ClipApiResponse[];
  error?: string;
}

export async function submitUrl(url: string): Promise<{ jobId: string }> {
  const response = await apiRequest("POST", "/api/clip", { url });
  return response.json();
}

export async function submitFile(file: File): Promise<{ jobId: string }> {
  const formData = new FormData();
  formData.append("video", file);

  const response = await fetch("/api/clip", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload file");
  }

  return response.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const response = await fetch(`/api/clip/${jobId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get job status");
  }

  return response.json();
}

export function getClipDownloadUrl(url: string): string {
  return url;
}

export function getClipStreamUrl(jobId: string, clipId: string): string {
  return `/api/stream/${jobId}/${clipId}`;
}
