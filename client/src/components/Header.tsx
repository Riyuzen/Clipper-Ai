import { Film } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 border-b flex items-center justify-between px-6 lg:px-8 bg-background sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary rounded-md">
          <Film className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold" data-testid="text-logo">Clipper AI</span>
      </div>
    </header>
  );
}
