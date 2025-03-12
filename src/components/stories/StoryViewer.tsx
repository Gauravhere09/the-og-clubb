
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { StoryCreator } from "./StoryCreator";
import { StoriesList } from "./StoriesList";
import { StoryView } from "./StoryView";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface StoryViewerProps {
  currentUserId: string;
}

export function StoryViewer({ currentUserId }: StoryViewerProps) {
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [viewingStory, setViewingStory] = useState<string | null>(null);

  // Aquí normalmente cargaríamos las historias reales de los amigos
  // Por ahora usamos datos de ejemplo
  const exampleStories = [
    // Tu propia historia
    { 
      id: "0", 
      userId: currentUserId, 
      username: "Tu", 
      avatarUrl: null, 
      hasUnseenStories: false 
    },
    // Historias de amigos
    { 
      id: "1", 
      userId: "friend1", 
      username: "Carlos", 
      avatarUrl: null, 
      hasUnseenStories: true 
    },
    { 
      id: "2", 
      userId: "friend2", 
      username: "Sofía", 
      avatarUrl: null, 
      hasUnseenStories: false 
    },
    { 
      id: "3", 
      userId: "friend3", 
      username: "Diego", 
      avatarUrl: null, 
      hasUnseenStories: true 
    }
  ];

  // Determinar si el usuario actual tiene una historia
  const userHasStory = exampleStories.some(
    (story) => story.userId === currentUserId && story.id !== "0"
  );

  return (
    <div className="mb-6">
      {showStoryCreator && (
        <StoryCreator 
          onClose={() => setShowStoryCreator(false)} 
          currentUserId={currentUserId}
        />
      )}
      
      {viewingStory && (
        <StoryView 
          storyId={viewingStory}
          onClose={() => setViewingStory(null)}
        />
      )}
      
      <div className="flex w-max space-x-4 p-4 overflow-x-auto">
        <TooltipProvider>
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex flex-col items-center space-y-1">
                <div className="relative cursor-pointer group">
                  <Avatar className="w-16 h-16 border-2 border-muted p-1">
                    <AvatarFallback>TU</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-background">
                    <Plus className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  Crear historia
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="flex flex-col gap-1">
                <button
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-sm"
                  onClick={() => setShowStoryCreator(true)}
                >
                  <Plus className="h-4 w-4" />
                  Subir historia
                </button>
                
                {userHasStory && (
                  <button
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-sm"
                    onClick={() => setViewingStory("0")}
                  >
                    <span className="h-4 w-4 flex items-center justify-center">👁️</span>
                    Ver tu historia
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </TooltipProvider>

        <StoriesList 
          stories={exampleStories} 
          onStoryClick={(storyId) => setViewingStory(storyId)}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
