
import { StoryCreator } from "./StoryCreator";
import { StoriesList } from "./StoriesList";
import { StoryView } from "./StoryView";
import { UserStoryButton } from "./UserStoryButton";
import { useStoryViewer } from "@/hooks/use-story-viewer";
import { Button } from "@/components/ui/button";
import { Plus, Image, Upload } from "lucide-react";

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
    <div className="mb-6 relative bg-background rounded-lg p-4 shadow border border-border">
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
      
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Historias</h3>
        
        <Button 
          size="sm" 
          variant="default" 
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          onClick={() => setShowStoryCreator(true)}
        >
          <Upload className="h-4 w-4" />
          <span>Crear historia</span>
        </Button>
      </div>
      
      <div className="flex w-full overflow-x-auto pb-2 space-x-4">
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
