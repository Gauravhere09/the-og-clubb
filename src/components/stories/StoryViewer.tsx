
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
          <Tooltip>
            <TooltipTrigger>
              <div className="flex flex-col items-center space-y-1">
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => setShowStoryCreator(true)}
                >
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Crear nueva historia</p>
            </TooltipContent>
          </Tooltip>
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
