import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import ClipCard, { type ClipData } from "./ClipCard";

interface ClipGridProps {
  clips: ClipData[];
  onDownload: (clip: ClipData) => void;
  onDownloadAll: () => void;
}

export default function ClipGrid({ clips, onDownload, onDownloadAll }: ClipGridProps) {
  if (clips.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold" data-testid="text-generated-clips">Generated Clips</h2>
          <Badge variant="secondary" data-testid="badge-clip-count">{clips.length}</Badge>
        </div>
        <Button variant="outline" onClick={onDownloadAll} data-testid="button-download-all">
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clips.map((clip) => (
          <ClipCard key={clip.id} clip={clip} onDownload={onDownload} />
        ))}
      </div>
    </div>
  );
}
