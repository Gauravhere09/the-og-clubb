
import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface StoryViewProps {
  storyId: string;
  onClose: () => void;
}

export function StoryView({ storyId, onClose }: StoryViewProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const { toast } = useToast();
  
  const { storyData, timeDisplay, isLoading, error } = useStory(storyId);
  
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la historia",
      });
      onClose();
    }
  }, [error, onClose, toast]);
  
  const { progress } = StoryProgress({ 
    isPaused, 
    currentImageIndex, 
    totalImages: storyData?.imageUrls?.length || 0,
    onComplete: handleClose,
    onImageComplete: () => {
      if (storyData?.imageUrls && currentImageIndex < storyData.imageUrls.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
      } else {
        handleClose();
      }
    }
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

  function handleClose() {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const toggleReactions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReactions(!showReactions);
    setIsPaused(!showReactions);
  };

  const handleContentClick = () => {
    if (!showComments && !showReactions) {
      setIsPaused(!isPaused);
    }
  };
  
  const handleNextImage = () => {
    if (storyData?.imageUrls && currentImageIndex < storyData.imageUrls.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };
  
  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };
  
  if (isLoading || !storyData) {
    return (
      <Dialog open={true} onOpenChange={() => handleClose()}>
        <DialogContent className="p-4 max-w-md h-[80vh] max-h-[600px] flex items-center justify-center">
          <div className="animate-pulse h-8 w-8 rounded-full bg-primary/30"></div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={true} onOpenChange={() => handleClose()}>
      <DialogContent 
        className={cn(
          "p-0 max-w-md h-[80vh] max-h-[600px] flex flex-col",
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
          currentImageIndex={currentImageIndex}
          totalImages={storyData.imageUrls.length}
          onClose={handleClose}
        />
        
        <StoryContent 
          imageUrls={storyData.imageUrls}
          currentImageIndex={currentImageIndex}
          onContentClick={handleContentClick}
          onNextImage={handleNextImage}
          onPrevImage={handlePrevImage}
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
            className="absolute bottom-16 left-0 right-0 px-4 py-2 bg-background/30 backdrop-blur-sm"
          />
        )}

        <StoryActions 
          isLiked={isLiked}
          toggleLike={toggleLike}
          toggleComments={toggleComments}
          toggleReactions={toggleReactions}
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
  );
}
