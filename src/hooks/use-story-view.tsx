
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStory } from "@/hooks/use-story";
import { StoryProgress } from "@/components/stories/StoryProgress";
import { useStoryComments } from "@/hooks/use-story-comments";
import { useStoryDeletion } from "@/hooks/use-story-deletion";

interface UseStoryViewProps {
  storyId: string;
  userId?: string;
  onClose: () => void;
}

export function useStoryView({ storyId, userId, onClose }: UseStoryViewProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showReactions, setShowReactions] = useState(false);

  const { storyData, timeDisplay } = useStory(storyId);
  
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
    userId: userId || currentUser?.id,
    ownerId: storyData.user.id,
    onClose
  });

  const { progress } = StoryProgress({ 
    isPaused, 
    currentImageIndex: currentMediaIndex, 
    totalImages: storyData.mediaItems.length || 1,
    onComplete: handleClose,
    onImageComplete: () => setCurrentMediaIndex(prev => prev + 1)
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

  return {
    storyData,
    timeDisplay,
    progress,
    isPaused,
    isExiting,
    currentMediaIndex,
    showReactions,
    showComments,
    showDeleteConfirm,
    comments,
    currentUser,
    canDeleteStory,
    setShowDeleteConfirm,
    setShowComments,
    setIsPaused,
    handleDeleteStory,
    handleClose,
    toggleReactionsPanel,
    togglePause,
    handleCommentsToggle,
    handleContentClick,
    handleNextMedia,
    handlePrevMedia,
    handleSendComment
  };
}
