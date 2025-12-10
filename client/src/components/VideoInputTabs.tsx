import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Link, X, FileVideo, Loader2 } from "lucide-react";

interface VideoInputTabsProps {
  onSubmit: (data: { type: "url" | "file"; url?: string; file?: File }) => void;
  isProcessing?: boolean;
}

export default function VideoInputTabs({ onSubmit, isProcessing = false }: VideoInputTabsProps) {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = () => {
    if (url.trim()) {
      onSubmit({ type: "url", url: url.trim() });
    }
  };

  const handleFileSubmit = () => {
    if (file) {
      onSubmit({ type: "file", file });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="url" className="gap-2 h-full" data-testid="tab-url">
            <Link className="w-4 h-4" />
            URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2 h-full" data-testid="tab-upload">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="mt-6">
          <div className="space-y-4">
            <Input
              type="url"
              placeholder="Paste YouTube URL or video link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 text-base"
              disabled={isProcessing}
              data-testid="input-url"
            />
            <Button
              onClick={handleUrlSubmit}
              disabled={!url.trim() || isProcessing}
              className="w-full sm:w-auto h-12 px-8 font-semibold"
              data-testid="button-generate-url"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Generate Clips"
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <div className="space-y-4">
            {!file ? (
              <Card
                className={`min-h-48 border-2 border-dashed flex flex-col items-center justify-center gap-4 p-8 cursor-pointer transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                data-testid="dropzone-upload"
              >
                <div className="p-4 rounded-full bg-muted">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Click to browse or drag and drop</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports MP4, MOV, AVI, MKV
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-file"
                />
              </Card>
            ) : (
              <Card className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-md bg-muted">
                  <FileVideo className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" data-testid="text-filename">{file.name}</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-filesize">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  disabled={isProcessing}
                  data-testid="button-remove-file"
                >
                  <X className="w-4 h-4" />
                </Button>
              </Card>
            )}

            <Button
              onClick={handleFileSubmit}
              disabled={!file || isProcessing}
              className="w-full sm:w-auto h-12 px-8 font-semibold"
              data-testid="button-generate-upload"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Generate Clips"
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
