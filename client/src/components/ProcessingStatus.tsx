import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2 } from "lucide-react";

export type ProcessingStep = 
  | "downloading"
  | "extracting"
  | "transcribing"
  | "detecting"
  | "generating";

interface ProcessingStatusProps {
  currentStep: ProcessingStep;
  progress: number;
}

const steps: { key: ProcessingStep; label: string }[] = [
  { key: "downloading", label: "Downloading video" },
  { key: "extracting", label: "Extracting audio" },
  { key: "transcribing", label: "Transcribing with AI" },
  { key: "detecting", label: "Detecting highlights" },
  { key: "generating", label: "Generating clips" },
];

export default function ProcessingStatus({ currentStep, progress }: ProcessingStatusProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <Card className="w-full max-w-2xl mx-auto p-8">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Processing your video</h2>
          <p className="text-muted-foreground mt-2">This may take a few minutes</p>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
          <p className="text-sm text-muted-foreground text-right" data-testid="text-progress">
            {progress}% complete
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                  isCurrent ? "bg-primary/10" : ""
                }`}
                data-testid={`step-${step.key}`}
              >
                {isComplete && (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                {isCurrent && (
                  <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                )}
                {isPending && (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                )}
                <span
                  className={`${
                    isCurrent
                      ? "font-medium"
                      : isPending
                      ? "text-muted-foreground"
                      : ""
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
