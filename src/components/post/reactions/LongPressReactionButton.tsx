
import React, { useRef, useCallback, useEffect, useState } from "react";
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
  const [isAuthChecking, setIsAuthChecking] = useState(false);
  
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
    handleReactionClick,
    checkAuthentication
  } = useLongPressReaction({
    userReaction,
    onReactionClick,
    postId
  });

  // Track authentication state 
  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsUserAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsUserAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
    
    setIsAuthChecking(true);
    try {
      // Check auth directly from supabase
      const { data } = await supabase.auth.getSession();
      const isAuthenticated = !!data.session;
      
      if (isAuthenticated) {
        if (userReaction) {
          // If user already has a reaction, toggle it directly
          handleButtonClick();
        } else {
          // Show reaction menu
          handlePressStart();
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
        });
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al verificar tu sesión. Intenta de nuevo.",
      });
    } finally {
      setIsAuthChecking(false);
    }
  }, [handlePressStart, handleButtonClick, userReaction, toast]);

  // Custom handler for pointer leave on reaction menu
  const handleMenuPointerLeave = useCallback(() => {
    handlePointerLeave();
    setShowReactions(false);
  }, [handlePointerLeave, setShowReactions]);

  // Toggle menu instead of direct action
  const handleToggleMenu = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAuthChecking(true);
    try {
      // Check auth directly with supabase
      const { data } = await supabase.auth.getSession();
      const isAuthenticated = !!data.session;
      
      if (isAuthenticated) {
        setShowReactions(prevState => !prevState);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
        });
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Error al verificar tu sesión. Intenta de nuevo.",
      });
    } finally {
      setIsAuthChecking(false);
    }
  }, [setShowReactions, toast]);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className={`flex-1 ${userReaction ? reactionIcons[userReaction].color : ''} group post-action-button`}
        onClick={userReaction ? handleAuthClick : handleToggleMenu}
        disabled={isSubmitting || isAuthChecking}
        id="reaction-button"
        name="reaction-button"
      >
        {userReaction ? (
          <div className="flex items-center">
            {React.createElement(reactionIcons[userReaction].icon, { className: "h-4 w-4 mr-2" })}
            <span>{userReaction === "like" ? "Me gusta" : reactionIcons[userReaction].label}</span>
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
