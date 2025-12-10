import { Film } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Film className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium" data-testid="text-empty-title">No clips yet</h3>
      <p className="text-muted-foreground mt-1" data-testid="text-empty-description">
        Submit a video URL or upload a file to generate highlight clips
      </p>
    </div>
  );
}
