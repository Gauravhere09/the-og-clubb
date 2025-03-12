
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";

interface StoryActionsProps {
  isLiked: boolean;
  toggleLike: (e: React.MouseEvent) => void;
  toggleComments: (e: React.MouseEvent) => void;
}

export function StoryActions({ isLiked, toggleLike, toggleComments }: StoryActionsProps) {
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
      <Button 
        variant="ghost" 
        size="icon" 
        className="bg-background/20 text-white hover:bg-background/40"
        onClick={toggleLike}
      >
        <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="bg-background/20 text-white hover:bg-background/40"
        onClick={toggleComments}
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    </div>
  );
}
