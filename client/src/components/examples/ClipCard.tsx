import ClipCard, { type ClipData } from '../ClipCard';

export default function ClipCardExample() {
  // todo: remove mock functionality
  const mockClip: ClipData = {
    id: "1",
    filename: "highlight_001.mp4",
    startTime: 45,
    endTime: 75,
    duration: 30,
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
  };

  const handleDownload = (clip: ClipData) => {
    console.log("Download triggered for:", clip.filename);
  };

  return <ClipCard clip={mockClip} onDownload={handleDownload} />;
}
