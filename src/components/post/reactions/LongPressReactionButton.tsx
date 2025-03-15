
import React, { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { reactionIcons, type ReactionType } from "./ReactionIcons";
import { useLongPressReaction } from "./hooks/use-long-press-reaction";
import { useReactionPointerEvents } from "./hooks/use-reaction-pointer-events";
import { ReactionMenu } from "./ReactionMenu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LongPressReactionButtonProps {
  userReaction?: ReactionType;
  onReactionClick: (type: ReactionType) => void;
  postId: string;
}

export function LongPressReactionButton({ 
  userReaction, 
  onReactionClick, 
  postId 
}: LongPressReactionButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();
  
  // Check authentication before any reaction action
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking auth:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al verificar tu sesión",
      });
      return false;
    }
  }, [toast]);
  
  // Use our custom hook for reaction logic
  const {
    isSubmitting,
    showReactions,
    activeReaction,
    setActiveReaction,
    setShowReactions,
    handlePressStart,
    handlePressEnd,
    handleButtonClick,
    handleReactionClick
  } = useLongPressReaction({
    userReaction,
    onReactionClick,
    postId
  });

  // Use our pointer events hook
  const { handlePointerLeave } = useReactionPointerEvents({
    showReactions,
    activeReaction,
    handlePressEnd,
    handlePointerMove: useCallback(() => {}, [])
  });

  // Handle click with auth check to show reactions menu
  const handleAuthClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
      if (userReaction) {
        // If user already has a reaction, toggle it directly
        handleButtonClick();
      } else {
        // Show reaction menu
        handlePressStart();
      }
    }
  }, [checkAuth, handlePressStart, handleButtonClick, userReaction]);

  // Custom handler for pointer leave on reaction menu
  const handleMenuPointerLeave = useCallback(() => {
    handlePointerLeave();
    setShowReactions(false);
  }, [handlePointerLeave, setShowReactions]);

  // Toggle menu instead of direct action
  const handleToggleMenu = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
      setShowReactions(prevState => !prevState);
    }
  }, [checkAuth, setShowReactions]);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className={`${userReaction ? reactionIcons[userReaction].color : ''} group`}
        onClick={userReaction ? handleAuthClick : handleToggleMenu}
        disabled={isSubmitting}
      >
        {userReaction ? (
          <div className="flex items-center">
            {React.createElement(reactionIcons[userReaction].icon, { className: "h-4 w-4" })}
            <span className="ml-2">{reactionIcons[userReaction].label}</span>
          </div>
        ) : (
          <div className="flex items-center">
            <ThumbsUp className="h-4 w-4 mr-2" />
            Me gusta
          </div>
        )}
      </Button>

      {/* Reaction Menu */}
      <ReactionMenu
        show={showReactions}
        activeReaction={activeReaction}
        setActiveReaction={setActiveReaction}
        onReactionSelected={handleReactionClick}
        onPointerLeave={handleMenuPointerLeave}
      />
    </div>
  );
}
