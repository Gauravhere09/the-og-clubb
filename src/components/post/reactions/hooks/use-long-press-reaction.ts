
import { useState, useCallback } from "react";
import { type ReactionType } from "../ReactionIcons";
import { useReactionAuth } from "./use-reaction-auth";
import { useReactionHandler } from "./use-reaction-handler";
import { useLongPress } from "./use-long-press";

interface UseLongPressReactionProps {
  userReaction?: ReactionType;
  onReactionClick: (type: ReactionType) => void;
  postId: string;
  longPressThreshold?: number;
}

export function useLongPressReaction({
  userReaction,
  onReactionClick,
  postId,
  longPressThreshold = 500,
}: UseLongPressReactionProps) {
  const { authError, isAuthenticated, validateSession } = useReactionAuth();
  
  const { isSubmitting, handleReactionClick } = useReactionHandler({
    postId,
    userReaction,
    onReactionClick,
    validateSession
  });

  // Wrap the reaction handler to include menu state management
  const [activeReactionState, setActiveReactionState] = useState<ReactionType | null>(null);
  const [showReactionsState, setShowReactionsState] = useState(false);

  // Handle completed long press with reaction selection
  const handleReactionComplete = useCallback((selectedReaction: ReactionType | null) => {
    if (selectedReaction) {
      handleReactionClick(selectedReaction);
    }
    setShowReactionsState(false);
    setActiveReactionState(null);
  }, [handleReactionClick]);

  // Use the long press hook
  const {
    showReactions,
    activeReaction,
    setActiveReaction,
    setShowReactions,
    handlePressStart,
    handlePressEnd
  } = useLongPress({
    longPressThreshold,
    onPressEnd: handleReactionComplete
  });

  // Handle click on the main button (non-long press)
  const handleButtonClick = useCallback(async () => {
    if (!showReactions && userReaction) {
      handleReactionClick(userReaction);
    }
  }, [handleReactionClick, showReactions, userReaction]);

  return {
    isSubmitting,
    showReactions,
    activeReaction,
    setActiveReaction,
    setShowReactions,
    handlePressStart,
    handlePressEnd,
    handleButtonClick,
    handleReactionClick,
    authError,
    isAuthenticated
  };
}
