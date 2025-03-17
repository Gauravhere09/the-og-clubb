
import { StoryCreator } from "./StoryCreator";
import { StoriesList } from "./StoriesList";
import { StoryView } from "./StoryView";
import { UserStoryButton } from "./UserStoryButton";
import { useStoryViewer } from "@/hooks/use-story-viewer";

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
    <div className="mb-6 relative">
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
      
      <div className="flex w-max space-x-4 p-4 overflow-x-auto">
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
