
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoryViewer } from "@/hooks/use-story-viewer";
import { StoriesList } from "./StoriesList";
import { StoryView } from "./StoryView";
import { StoryCreator } from "./StoryCreator";
import { Card } from "@/components/ui/card";

interface StoryBannerProps {
  currentUserId: string;
}

export function StoryBanner({ currentUserId }: StoryBannerProps) {
  const {
    showStoryCreator,
    setShowStoryCreator,
    viewingStory,
    setViewingStory,
    stories,
    isLoading,
    refetchStories
  } = useStoryViewer(currentUserId);

  // Handle story creation completion
  const handleStoryCreatorClose = () => {
    setShowStoryCreator(false);
    refetchStories();
  };

  // Find the current user's story
  const userStory = stories.find(story => story.userId === currentUserId);

  return (
    <Card className="p-4 mb-4 relative overflow-hidden">
      {showStoryCreator && (
        <StoryCreator 
          onClose={handleStoryCreatorClose} 
          currentUserId={currentUserId}
        />
      )}
      
      {viewingStory && (
        <StoryView 
          storyId={viewingStory}
          onClose={() => setViewingStory(null)}
        />
      )}

      <div className="flex w-full overflow-x-auto scrollbar-hide gap-4 pb-2">
        {/* Create story button */}
        <div 
          className="flex flex-col items-center gap-1 cursor-pointer min-w-[76px]"
          onClick={() => setShowStoryCreator(true)}
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <div className="w-14 h-14 bg-background rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
          </div>
          <span className="text-xs font-medium text-center">
            Crear historia
          </span>
        </div>

        {/* Stories list */}
        {!isLoading && stories.length > 0 && (
          <>
            {stories.map((story) => {
              const hasUnseenStories = story.hasUnseenStories;
              const firstStoryId = story.storyIds && story.storyIds.length > 0 
                ? story.storyIds[0] 
                : story.id;
                
              return (
                <div 
                  key={story.id}
                  className="flex flex-col items-center gap-1 cursor-pointer min-w-[76px]"
                  onClick={() => setViewingStory(firstStoryId)}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    hasUnseenStories ? 'border-2 border-primary p-[2px]' : 'p-0'
                  }`}>
                    <Avatar className="w-full h-full border-2 border-background">
                      <AvatarImage src={story.avatarUrl || undefined} />
                      <AvatarFallback>{story.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs font-medium text-center truncate w-full">
                    {story.username}
                  </span>
                </div>
              );
            })}
            
            {/* Show more button when there are many stories */}
            {stories.length > 5 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="self-center min-w-[40px] h-16 rounded-full bg-muted/50"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </>
        )}
        
        {/* Loading placeholders */}
        {isLoading && (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[76px]">
                <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                <div className="w-16 h-2 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </>
        )}
      </div>
    </Card>
  );
}
