import ClipGrid from '../ClipGrid';
import { type ClipData } from '../ClipCard';

export default function ClipGridExample() {
  // todo: remove mock functionality
  const mockClips: ClipData[] = [
    {
      id: "1",
      filename: "highlight_001.mp4",
      startTime: 45,
      endTime: 75,
      duration: 30,
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
    {
      id: "2",
      filename: "highlight_002.mp4",
      startTime: 120,
      endTime: 150,
      duration: 30,
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
    {
      id: "3",
      filename: "highlight_003.mp4",
      startTime: 200,
      endTime: 225,
      duration: 25,
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
  ];

  const handleDownload = (clip: ClipData) => {
    console.log("Download triggered for:", clip.filename);
  };

  const handleDownloadAll = () => {
    console.log("Download all triggered");
  };

  return (
    <ClipGrid 
      clips={mockClips} 
      onDownload={handleDownload} 
      onDownloadAll={handleDownloadAll} 
    />
  );
}
