
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryMenu } from "./StoryMenu";

interface StoryControlsProps {
  isPaused: boolean;
  canDelete: boolean;
  onPauseToggle: (e: React.MouseEvent) => void;
  onDeleteRequest: () => void;
}

export function StoryControls({ 
  isPaused, 
  canDelete, 
  onPauseToggle, 
  onDeleteRequest 
}: StoryControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
      <StoryMenu 
        canDelete={canDelete} 
        onDeleteRequest={onDeleteRequest} 
      />

      <Button
        size="icon"
        variant="ghost"
        className="bg-black/50 text-white hover:bg-black/70"
        onClick={onPauseToggle}
        title={isPaused ? "Reanudar" : "Pausar"}
      >
        {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
      </Button>
    </div>
  );
}
