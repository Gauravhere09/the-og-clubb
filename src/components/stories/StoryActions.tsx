
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Link, Trash2, Bug } from "lucide-react";

interface StoryActionsProps {
  isLiked: boolean;
  toggleLike: (e: React.MouseEvent) => void;
  toggleComments: (e: React.MouseEvent) => void;
  toggleReactions: (e: React.MouseEvent) => void;
  className?: string;
  onDeleteStory?: () => void;
  canDelete?: boolean;
}

export function StoryActions({ 
  isLiked, 
  toggleLike, 
  toggleComments, 
  toggleReactions,
  className,
  onDeleteStory,
  canDelete = false
}: StoryActionsProps) {
  return (
    <div className={cn("p-4 flex justify-between items-center bg-background/10 backdrop-blur-sm", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:text-white hover:bg-white/20 dark:text-white"
        onClick={toggleComments}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white hover:bg-white/20 dark:text-white"
          >
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-900 text-white border-gray-800 dark:bg-gray-900 w-72 p-0">
          <DropdownMenuItem className="py-3 px-4 hover:bg-gray-800 cursor-pointer flex items-center gap-3 text-white dark:text-white">
            <Link className="h-5 w-5" />
            <div className="flex flex-col">
              <span className="font-medium">Copiar enlace para compartir esta historia</span>
              <span className="text-xs text-gray-400">La audiencia podrá ver tu historia durante 24 horas.</span>
            </div>
          </DropdownMenuItem>
          
          {canDelete && (
            <DropdownMenuItem 
              className="py-3 px-4 hover:bg-gray-800 cursor-pointer flex items-center gap-3 text-red-400"
              onClick={onDeleteStory}
            >
              <Trash2 className="h-5 w-5" />
              <span className="font-medium">Eliminar foto</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem className="py-3 px-4 hover:bg-gray-800 cursor-pointer flex items-center gap-3 text-white dark:text-white">
            <Bug className="h-5 w-5" />
            <span className="font-medium">Algo no funciona</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
