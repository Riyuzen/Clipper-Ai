import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import VideoInputTabs from "@/components/VideoInputTabs";
import ProcessingStatus, { type ProcessingStep } from "@/components/ProcessingStatus";
import ClipGrid from "@/components/ClipGrid";
import EmptyState from "@/components/EmptyState";
import { type ClipData } from "@/components/ClipCard";
import { useToast } from "@/hooks/use-toast";
import { submitUrl, submitFile, getJobStatus, getClipStreamUrl } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

type AppState = "idle" | "processing" | "complete" | "error";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [currentStep, setCurrentStep] = useState<ProcessingStep>("downloading");
  const [progress, setProgress] = useState(0);
  const [clips, setClips] = useState<ClipData[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const pollJobStatus = useCallback(async (id: string) => {
    try {
      const status = await getJobStatus(id);

      if (status.status === "error") {
        setAppState("error");
        setError(status.error || "An error occurred while processing the video");
        setIsProcessing(false);
        return;
      }

      if (status.status === "complete") {
        const processedClips: ClipData[] = status.clips.map((clip) => ({
          id: clip.id,
          filename: clip.filename,
          startTime: clip.startTime,
          endTime: clip.endTime,
          duration: clip.duration,
          url: getClipStreamUrl(id, clip.id),
        }));

        setClips(processedClips);
        setAppState("complete");
        setIsProcessing(false);

        toast({
          title: "Clips generated successfully",
          description: `Created ${processedClips.length} highlight clips from your video.`,
        });
        return;
      }

      const stepMap: Record<string, ProcessingStep> = {
        pending: "downloading",
        downloading: "downloading",
        extracting: "extracting",
        transcribing: "transcribing",
        detecting: "detecting",
        generating: "generating",
      };

      setCurrentStep(stepMap[status.status] || "downloading");
      setProgress(status.progress);

      setTimeout(() => pollJobStatus(id), 2000);
    } catch (err: any) {
      setAppState("error");
      setError(err.message || "Failed to check job status");
      setIsProcessing(false);
    }
  }, [toast]);

  const handleSubmit = async (data: { type: "url" | "file"; url?: string; file?: File }) => {
    setIsProcessing(true);
    setAppState("processing");
    setProgress(0);
    setCurrentStep("downloading");
    setError(null);

    try {
      let result;

      if (data.type === "url" && data.url) {
        result = await submitUrl(data.url);
      } else if (data.type === "file" && data.file) {
        result = await submitFile(data.file);
      } else {
        throw new Error("No video source provided");
      }

      setJobId(result.jobId);
      pollJobStatus(result.jobId);
    } catch (err: any) {
      setAppState("error");
      setError(err.message || "Failed to submit video");
      setIsProcessing(false);
    }
  };

  const handleDownload = (clip: ClipData) => {
    const link = document.createElement("a");
    link.href = clip.url.replace("/api/stream/", "/api/result/");
    link.download = clip.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: `Downloading ${clip.filename}`,
    });
  };

  const handleDownloadAll = () => {
    clips.forEach((clip, index) => {
      setTimeout(() => handleDownload(clip), index * 500);
    });
  };

  const handleReset = () => {
    setAppState("idle");
    setClips([]);
    setProgress(0);
    setJobId(null);
    setError(null);
  };

  const handleRetry = () => {
    setAppState("idle");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 lg:px-8">
        {appState === "idle" && (
          <section className="py-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4" data-testid="text-hero-title">
                Generate Highlight Clips with AI
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-description">
                Upload a video or paste a URL. Our AI will transcribe, detect key moments,
                and create shareable clips automatically.
              </p>
            </div>
            <VideoInputTabs onSubmit={handleSubmit} isProcessing={isProcessing} />
          </section>
        )}

        {appState === "processing" && (
          <section className="py-16">
            <ProcessingStatus currentStep={currentStep} progress={progress} />
          </section>
        )}

        {appState === "error" && (
          <section className="py-16">
            <Card className="w-full max-w-2xl mx-auto p-8">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-semibold" data-testid="text-error-title">Something went wrong</h2>
                <p className="text-muted-foreground" data-testid="text-error-message">{error}</p>
                <Button onClick={handleRetry} data-testid="button-retry">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </Card>
          </section>
        )}

        {appState === "complete" && (
          <section className="py-12 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
              <div>
                <h2 className="text-xl font-semibold" data-testid="text-results-title">Your clips are ready</h2>
                <p className="text-muted-foreground" data-testid="text-results-description">
                  Preview and download your AI-generated highlight clips
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-sm text-primary hover:underline"
                data-testid="button-new-video"
              >
                Process another video
              </button>
            </div>

            {clips.length > 0 ? (
              <ClipGrid
                clips={clips}
                onDownload={handleDownload}
                onDownloadAll={handleDownloadAll}
              />
            ) : (
              <EmptyState />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
