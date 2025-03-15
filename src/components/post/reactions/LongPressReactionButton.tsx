
import React, { useRef, useCallback, useState, useEffect } from "react";
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuthStatus();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Check authentication before starting long press process
  const checkAuth = useCallback(async () => {
    // First check the cached state for better UX
    if (isAuthenticated === false) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para reaccionar",
      });
      return false;
    }
    
    // Double check with the server to be sure
    try {
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data.session;
      
      // Update the cached state if it's different
      if (isAuthenticated !== hasSession) {
        setIsAuthenticated(hasSession);
      }
      
      if (!hasSession) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking authentication:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al verificar tu sesión. Intenta de nuevo.",
      });
      return false;
    }
  }, [isAuthenticated, toast]);
  
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

  // Handle pointer movement for tracking reactions
  const handlePointerMove = useCallback((e: PointerEvent) => {
    // This is handled inside the ReactionMenu component
  }, []);

  // Use our pointer events hook
  const { handlePointerLeave } = useReactionPointerEvents({
    showReactions,
    activeReaction,
    handlePressEnd,
    handlePointerMove
  });

  // Handle press start with auth check
  const handleAuthPressStart = useCallback(async () => {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
      handlePressStart();
    }
  }, [checkAuth, handlePressStart]);

  // Button click with auth check
  const handleAuthButtonClick = useCallback(async () => {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
      handleButtonClick();
    }
  }, [checkAuth, handleButtonClick]);

  // Touch event handlers that are properly typed
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleAuthPressStart();
  }, [handleAuthPressStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    handlePressEnd();
  }, [handlePressEnd]);

  // Custom handler for pointer leave on reaction menu
  const handleMenuPointerLeave = useCallback(() => {
    handlePointerLeave();
    setShowReactions(false);
  }, [handlePointerLeave, setShowReactions]);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className={`${userReaction ? reactionIcons[userReaction].color : ''} group`}
        onClick={handleAuthButtonClick}
        disabled={isSubmitting}
        onPointerDown={handleAuthPressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
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
