
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Upload } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TooltipProvider } from "@/components/ui/tooltip";

interface UserStoryButtonProps {
  currentUserId: string;
  userStory: any;
  onCreateStory: () => void;
  onViewStory: (storyId: string) => void;
}

export function UserStoryButton({ 
  currentUserId, 
  userStory, 
  onCreateStory, 
  onViewStory 
}: UserStoryButtonProps) {
  // Check if the user has stories and get the first story ID
  const hasStories = userStory && userStory.storyIds && userStory.storyIds.length > 0;
  const firstStoryId = hasStories ? userStory.storyIds[0] : null;
  
  const handleViewStory = () => {
    if (firstStoryId) {
      onViewStory(firstStoryId);
    }
  };

  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex flex-col items-center space-y-1">
            <div 
              className="relative cursor-pointer group"
              onClick={hasStories ? handleViewStory : onCreateStory}
            >
              <Avatar className={`w-16 h-16 border-2 ${hasStories ? 'border-primary' : 'border-muted'} p-1`}>
                <AvatarImage src={userStory?.avatarUrl || undefined} />
                <AvatarFallback>TU</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-background">
                {hasStories ? (
                  <Eye className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Upload className="h-4 w-4 text-primary-foreground" />
                )}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {hasStories ? 'Tu historia' : 'Crear historia'}
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2">
          <div className="flex flex-col gap-1">
            {!hasStories && (
              <button
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-sm"
                onClick={onCreateStory}
              >
                <Upload className="h-4 w-4" />
                Subir historia
              </button>
            )}
            
            {hasStories && (
              <>
                <button
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-sm"
                  onClick={handleViewStory}
                >
                  <Eye className="h-4 w-4" />
                  Ver tu historia
                </button>
                <button
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-sm"
                  onClick={onCreateStory}
                >
                  <Upload className="h-4 w-4" />
                  Agregar historia
                </button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
