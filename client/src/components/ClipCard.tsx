import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Play } from "lucide-react";
import { useRef, useState } from "react";

export interface ClipData {
  id: string;
  filename: string;
  startTime: number;
  endTime: number;
  duration: number;
  url: string;
}

interface ClipCardProps {
  clip: ClipData;
  onDownload: (clip: ClipData) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function ClipCard({ clip, onDownload }: ClipCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-clip-${clip.id}`}>
      <div className="relative aspect-video bg-muted">
        <video
          ref={videoRef}
          src={clip.url}
          className="w-full h-full object-cover"
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          controls
          data-testid={`video-player-${clip.id}`}
        />
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 bg-black/70 text-white border-0"
          data-testid={`badge-timestamp-${clip.id}`}
        >
          {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
        </Badge>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground" data-testid={`text-duration-${clip.id}`}>
            Duration: {formatTime(clip.duration)}
          </p>
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => onDownload(clip)}
          data-testid={`button-download-${clip.id}`}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Clip
        </Button>
      </div>
    </Card>
  );
}
