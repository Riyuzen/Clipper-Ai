import { useState, useEffect } from "react";
import Header from "@/components/Header";
import VideoInputTabs from "@/components/VideoInputTabs";
import ProcessingStatus, { type ProcessingStep } from "@/components/ProcessingStatus";
import ClipGrid from "@/components/ClipGrid";
import EmptyState from "@/components/EmptyState";
import { type ClipData } from "@/components/ClipCard";
import { useToast } from "@/hooks/use-toast";

type AppState = "idle" | "processing" | "complete";

// todo: remove mock functionality
const mockClips: ClipData[] = [
  {
    id: "1",
    filename: "highlight_001.mp4",
    startTime: 12,
    endTime: 42,
    duration: 30,
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: "2",
    filename: "highlight_002.mp4",
    startTime: 95,
    endTime: 120,
    duration: 25,
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: "3",
    filename: "highlight_003.mp4",
    startTime: 180,
    endTime: 210,
    duration: 30,
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
];

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [currentStep, setCurrentStep] = useState<ProcessingStep>("downloading");
  const [progress, setProgress] = useState(0);
  const [clips, setClips] = useState<ClipData[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (data: { type: "url" | "file"; url?: string; file?: File }) => {
    setAppState("processing");
    setProgress(0);
    setCurrentStep("downloading");

    // todo: remove mock functionality - simulating processing steps
    const steps: ProcessingStep[] = ["downloading", "extracting", "transcribing", "detecting", "generating"];
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      const baseProgress = (i / steps.length) * 100;
      const stepProgress = 100 / steps.length;
      
      for (let p = 0; p <= stepProgress; p += 5) {
        await new Promise((r) => setTimeout(r, 100));
        setProgress(Math.min(Math.round(baseProgress + p), 100));
      }
    }

    setClips(mockClips);
    setAppState("complete");
    
    toast({
      title: "Clips generated successfully",
      description: `Created ${mockClips.length} highlight clips from your video.`,
    });
  };

  const handleDownload = (clip: ClipData) => {
    // todo: replace with real download
    const link = document.createElement("a");
    link.href = clip.url;
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
    // todo: replace with real bulk download
    clips.forEach((clip) => {
      handleDownload(clip);
    });
  };

  const handleReset = () => {
    setAppState("idle");
    setClips([]);
    setProgress(0);
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
            <VideoInputTabs onSubmit={handleSubmit} isProcessing={false} />
          </section>
        )}

        {appState === "processing" && (
          <section className="py-16">
            <ProcessingStatus currentStep={currentStep} progress={progress} />
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
