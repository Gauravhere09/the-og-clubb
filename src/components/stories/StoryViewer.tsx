
import { useState } from "react";
import { StoryCreator } from "./StoryCreator";
import { StoriesList } from "./StoriesList";
import { StoryView } from "./StoryView";
import { useStoryViewer } from "@/hooks/use-story-viewer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { UserStoryButton } from "./UserStoryButton";

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
    <div className="relative overflow-hidden">
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
      
      <div className="flex overflow-x-auto gap-1 py-4 px-2 scrollbar-hide">
        {/* User's own story button - always visible */}
        <UserStoryButton
          currentUserId={currentUserId}
          userStory={userStory}
          onCreateStory={() => setShowStoryCreator(true)}
          onViewStory={(storyId) => setViewingStory(storyId)}
        />

        {/* Other users' stories */}
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
              <div key={i} className="flex flex-col items-center gap-1 min-w-[80px] mx-1">
                <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                <div className="w-16 h-2 bg-muted animate-pulse rounded mt-1" />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
