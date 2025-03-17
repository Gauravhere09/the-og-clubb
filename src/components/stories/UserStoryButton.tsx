
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Plus, Image, Camera } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

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
      <Tooltip>
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex flex-col items-center space-y-1 min-w-[64px]">
              <TooltipTrigger asChild>
                <div 
                  className="relative cursor-pointer group transition-all"
                  onClick={hasStories ? handleViewStory : onCreateStory}
                >
                  <Avatar className={`w-16 h-16 ${hasStories ? 'border-2 border-primary' : 'border-2 border-muted hover:border-primary/60'} p-1 transition-all`}>
                    <AvatarImage src={userStory?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">TU</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-background animate-pulse">
                    {hasStories ? (
                      <Eye className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Camera className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <span className="text-xs font-medium text-primary">
                {hasStories ? 'Tu historia' : 'Crear historia'}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2">
            <div className="flex flex-col gap-1">
              {!hasStories && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 w-full"
                  onClick={onCreateStory}
                >
                  <Camera className="h-4 w-4" />
                  Crear historia
                </Button>
              )}
              
              {hasStories && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 w-full"
                    onClick={handleViewStory}
                  >
                    <Eye className="h-4 w-4" />
                    Ver tu historia
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2 w-full"
                    onClick={onCreateStory}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar historia
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <TooltipContent side="bottom">
          {hasStories ? 'Ver tu historia' : 'Crear una nueva historia'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
