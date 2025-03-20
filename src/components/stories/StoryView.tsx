
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { StoryHeader } from "./StoryHeader";
import { StoryContent } from "./StoryContent";
import { StoryActions } from "./StoryActions";
import { StoryComments } from "./StoryComments";
import { cn } from "@/lib/utils";
import { StoryReaction } from "./StoryReaction";
import { StoryReactionSummary } from "./StoryReactionSummary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStory } from "@/hooks/use-story";
import { StoryProgress } from "./StoryProgress";
import { useStoryComments } from "@/hooks/use-story-comments";
import { StoryControls } from "./StoryControls";
import { StoryReplyInput } from "./StoryReplyInput";
import { StoryDeleteConfirmation } from "./StoryDeleteConfirmation";
import { useStoryDeletion } from "@/hooks/use-story-deletion";

interface StoryViewProps {
  storyId: string;
  onClose: () => void;
}

export function StoryView({ storyId, onClose }: StoryViewProps) {
  
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  
  const { storyData, timeDisplay } = useStory(storyId);
  const { progress } = StoryProgress({ 
    isPaused, 
    currentImageIndex: currentMediaIndex, 
    totalImages: storyData.mediaItems.length || 1,
    onComplete: handleClose,
    onImageComplete: () => setCurrentMediaIndex(prev => prev + 1)
  });
  
  const { 
    comments, 
    showComments, 
    handleSendComment, 
    toggleComments, 
    setShowComments 
  } = useStoryComments();
  
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const {
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeleteStory,
    canDeleteStory
  } = useStoryDeletion({
    storyId,
    userId: currentUser?.id,
    ownerId: storyData.user.id,
    onClose
  });

  function handleClose() {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }

  const toggleReactionsPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReactions(!showReactions);
    setIsPaused(true);
  };

  const togglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(!isPaused);
  };

  const handleCommentsToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleComments(e);
    setIsPaused(true);
  };

  const handleContentClick = () => {
    if (!showComments && !showReactions) {
      setIsPaused(!isPaused);
    }
  };
  
  const handleNextMedia = () => {
    if (currentMediaIndex < storyData.mediaItems.length - 1) {
      setCurrentMediaIndex(prev => prev + 1);
    }
  };
  
  const handlePrevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1);
    }
  };
  
  return (
    <>
      <Dialog open={true} onOpenChange={() => handleClose()}>
        <DialogContent 
          className={cn(
            "p-0 max-w-md h-[80vh] max-h-[600px] flex flex-col bg-black",
            "animate-in fade-in-0 zoom-in-95 duration-300",
            isExiting && "animate-out fade-out-0 zoom-out-95 duration-300"
          )}
          aria-describedby="story-dialog-description"
        >
          <DialogTitle className="sr-only">Ver historia</DialogTitle>
          <span id="story-dialog-description" className="sr-only">
            Contenido de la historia de {storyData.user.username}
          </span>
          
          <StoryHeader 
            username={storyData.user.username}
            avatarUrl={storyData.user.avatarUrl}
            timeDisplay={timeDisplay}
            progress={progress}
            currentImageIndex={currentMediaIndex}
            totalImages={storyData.mediaItems.length || 1}
            onClose={handleClose}
          />
          
          <StoryControls 
            isPaused={isPaused}
            canDelete={canDeleteStory}
            onPauseToggle={togglePause}
            onDeleteRequest={() => setShowDeleteConfirm(true)}
          />
          
          <StoryContent 
            mediaItems={storyData.mediaItems || []}
            currentIndex={currentMediaIndex}
            onContentClick={handleContentClick}
            onNextImage={handleNextMedia}
            onPrevImage={handlePrevMedia}
            isPaused={isPaused}
            className={cn(
              "animate-in fade-in-0 duration-300",
              isExiting && "animate-out fade-out-0 duration-300"
            )}
          />

          <div className="absolute bottom-20 left-4 z-10">
            <StoryReactionSummary storyId={storyId} />
          </div>

          {currentUser && (
            <StoryReaction 
              storyId={storyId}
              userId={currentUser.id}
              showReactions={showReactions}
              className="absolute bottom-24 left-0 right-0 px-4 py-2"
            />
          )}

          <StoryReplyInput 
            onFocus={() => {
              setIsPaused(true);
              setShowComments(true);
            }}
          />

          <StoryActions 
            toggleComments={handleCommentsToggle}
            toggleReactions={toggleReactionsPanel}
            onDeleteStory={() => setShowDeleteConfirm(true)}
            canDelete={canDeleteStory}
            className={cn(
              "animate-in slide-in-from-bottom duration-300",
              isExiting && "animate-out slide-out-to-bottom duration-300"
            )}
          />

          {showComments && (
            <StoryComments 
              comments={comments}
              onSendComment={handleSendComment}
              onClose={() => {
                setShowComments(false);
                setIsPaused(false);
              }}
              className="animate-in slide-in-from-bottom duration-300"
            />
          )}
        </DialogContent>
      </Dialog>

      <StoryDeleteConfirmation 
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteStory}
      />
    </>
  );
}
