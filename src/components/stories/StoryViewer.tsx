
import { StoryCreator } from "./StoryCreator";
import { StoriesList } from "./StoriesList";
import { StoryView } from "./StoryView";
import { UserStoryButton } from "./UserStoryButton";
import { useStoryViewer } from "@/hooks/use-story-viewer";
import { Button } from "@/components/ui/button";
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
  
  // Create a placeholder array when loading
  const allStories = isLoading
    ? [{ 
        id: "0", 
        userId: currentUserId, 
        username: "Tu", 
        avatarUrl: null, 
        hasUnseenStories: false 
      }]
    : stories;

  return (
    <div className="mb-4 relative bg-background rounded-lg p-4 shadow border border-border overflow-hidden">
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
      
      <div className="mb-3 flex justify-between items-center">
        <h3 className="text-sm font-medium text-foreground">Historias</h3>
        <Button 
          size="sm" 
          variant="ghost" 
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/90"
          onClick={() => setShowStoryCreator(true)}
        >
          Crear historia
        </Button>
      </div>
      
      <div className="flex w-full overflow-x-auto pb-2 pt-1 space-x-3 scrollbar-hide">
        <UserStoryButton
          currentUserId={currentUserId}
          userStory={userStory}
          onCreateStory={() => setShowStoryCreator(true)}
          onViewStory={(storyId) => setViewingStory(storyId)}
        />

        <StoriesList 
          stories={allStories.filter(story => story.userId !== currentUserId)} 
          onStoryClick={(storyId) => setViewingStory(storyId)}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
