import VideoInputTabs from '../VideoInputTabs';

export default function VideoInputTabsExample() {
  const handleSubmit = (data: { type: "url" | "file"; url?: string; file?: File }) => {
    console.log("Submit triggered:", data);
  };

  return <VideoInputTabs onSubmit={handleSubmit} />;
}
