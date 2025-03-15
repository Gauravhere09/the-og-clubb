
import { useState, useCallback } from "react";
import { type ReactionType } from "../ReactionIcons";
import { useReactionAuth } from "./use-reaction-auth";
import { useReactionHandler } from "./use-reaction-handler";
import { useLongPress } from "./use-long-press";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Add loading and error states to better manage the UI feedback
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  
  const { isSubmitting, handleReactionClick } = useReactionHandler({
    postId,
    userReaction,
    onReactionClick,
    validateSession
  });

  // Check authentication directly from Supabase
  const checkAuthentication = useCallback(async () => {
    setIsCheckingAuth(true);
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (error) {
      console.error("Error checking auth:", error);
      return false;
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  // Wrap the reaction handler to include menu state management
  const [activeReactionState, setActiveReactionState] = useState<ReactionType | null>(null);
  const [showReactionsState, setShowReactionsState] = useState(false);

  // Handle completed reaction selection
  const handleReactionComplete = useCallback(async (selectedReaction: ReactionType | null) => {
    if (selectedReaction) {
      // First check authentication before processing the reaction
      const isLoggedIn = await checkAuthentication();
      if (isLoggedIn) {
        handleReactionClick(selectedReaction);
      }
    }
    setShowReactionsState(false);
    setActiveReactionState(null);
  }, [handleReactionClick, checkAuthentication]);

  // Use the modified long press hook
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

  // Handle click on the main button (for existing reaction)
  const handleButtonClick = useCallback(async () => {
    if (userReaction) {
      const isLoggedIn = await checkAuthentication();
      if (isLoggedIn) {
        handleReactionClick(userReaction);
      }
    }
  }, [handleReactionClick, userReaction, checkAuthentication]);

  return {
    isSubmitting: isSubmitting || isCheckingAuth,
    showReactions,
    activeReaction,
    setActiveReaction,
    setShowReactions,
    handlePressStart,
    handlePressEnd,
    handleButtonClick,
    handleReactionClick,
    authError,
    isAuthenticated,
    checkAuthentication
  };
}
