
import { Heart, MessageCircle, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StoryActionsProps {
  isLiked: boolean;
  toggleLike: (e: React.MouseEvent) => void;
  toggleComments: (e: React.MouseEvent) => void;
  toggleReactions: (e: React.MouseEvent) => void;
  className?: string;
}

export function StoryActions({ 
  isLiked, 
  toggleLike, 
  toggleComments, 
  toggleReactions,
  className 
}: StoryActionsProps) {
  return (
    <div className={cn("p-4 flex justify-center gap-4 bg-background/10 backdrop-blur-sm", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn("text-white hover:text-white hover:bg-white/20", 
          isLiked && "text-red-500 hover:text-red-500"
        )}
        onClick={toggleLike}
      >
        <Heart className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:text-white hover:bg-white/20"
        onClick={toggleReactions}
      >
        <Smile className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:text-white hover:bg-white/20"
        onClick={toggleComments}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}
