
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Link, Trash2, Bug, MessageSquare, Heart } from "lucide-react";

interface StoryActionsProps {
  toggleComments: (e: React.MouseEvent) => void;
  toggleReactions: (e: React.MouseEvent) => void;
  className?: string;
  onDeleteStory?: () => void;
  canDelete?: boolean;
}

export function StoryActions({ 
  toggleComments, 
  toggleReactions,
  className,
  onDeleteStory,
  canDelete = false
}: StoryActionsProps) {
  return (
    <div className={cn("absolute bottom-16 left-0 right-0 px-4 flex flex-col gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="w-full bg-black/80 dark:bg-black/80 text-white hover:bg-black/90 dark:hover:bg-black/90 flex items-center gap-2 backdrop-blur-sm rounded-full"
        onClick={toggleComments}
      >
        <MessageSquare className="h-5 w-5" />
        <span>Comentar</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full bg-black/80 dark:bg-black/80 text-white hover:bg-black/90 dark:hover:bg-black/90 flex items-center gap-2 backdrop-blur-sm rounded-full"
        onClick={toggleReactions}
      >
        <Heart className="h-5 w-5" />
        <span>Reaccionar</span>
      </Button>
    </div>
  );
}
