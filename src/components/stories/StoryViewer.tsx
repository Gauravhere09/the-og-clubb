
import { StoryCreator } from "./StoryCreator";
import { StoriesList } from "./StoriesList";
import { StoryView } from "./StoryView";
import { useStoryViewer } from "@/hooks/use-story-viewer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

interface StoryViewerProps {
  currentUserId: string;
}

export function StoryViewer({ currentUserId }: StoryViewerProps) {
  const {
    showStoryCreator,
    setShowStoryCreator,
    viewingStory,
    setViewingStory,
    stories,
    isLoading,
    refetchStories
  } = useStoryViewer(currentUserId);

  // Find the current user's story
  const userStory = stories.find(story => story.userId === currentUserId);
  
  // Handle story creation completion
  const handleStoryCreatorClose = () => {
    setShowStoryCreator(false);
    refetchStories();
  };

  return (
    <div className="p-4 relative overflow-hidden">
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
          className="flex flex-col items-center gap-1 cursor-pointer min-w-[80px]"
          onClick={() => setShowStoryCreator(true)}
        >
          <div className="w-16 h-16 rounded-full relative bg-primary/10 flex items-center justify-center">
            <div className="w-[58px] h-[58px] bg-background rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
          </div>
          <span className="text-xs font-medium text-center">
            Crear historia
          </span>
        </div>

        {/* User stories */}
        {!isLoading && stories.length > 0 && (
          <StoriesList 
            stories={stories.filter(story => story.userId !== currentUserId)} 
            onStoryClick={(storyId) => setViewingStory(storyId)}
            currentUserId={currentUserId}
          />
        )}
        
        {/* Loading placeholders */}
        {isLoading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[80px]">
                <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                <div className="w-16 h-2 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
