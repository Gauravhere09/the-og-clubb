
import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactionType } from "../ReactionIcons";

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
  longPressThreshold = 500, // Default threshold
}: UseLongPressReactionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  // Memoize the reaction handler to prevent unnecessary re-renders
  const handleReactionClick = useCallback(async (type: ReactionType) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
        });
        return;
      }

      // We'll handle the UI update AFTER the database operation is complete
      if (userReaction === type) {
        // If the user clicks on their current reaction, remove it
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', data.session.user.id);

        if (error) throw error;
        
        // Only update UI after successful database operation
        onReactionClick(type);
      } else {
        // First delete any existing reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', data.session.user.id);

        // Then insert the new reaction
        const { error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: data.session.user.id,
            reaction_type: type
          });

        if (error) throw error;
        
        // Only update UI after successful database operation
        onReactionClick(type);
      }
      
      // Invalidate the posts and reactions queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      await queryClient.invalidateQueries({ queryKey: ["post-reactions", postId] });
      
    } catch (error) {
      console.error('Error al gestionar la reacción:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar tu reacción",
      });
    } finally {
      setIsSubmitting(false);
      setShowReactions(false);
      setActiveReaction(null);
    }
  }, [isSubmitting, onReactionClick, postId, queryClient, toast, userReaction]);

  const handlePressStart = useCallback(() => {
    pressTimer.current = setTimeout(() => {
      setShowReactions(true);
    }, longPressThreshold);
  }, [longPressThreshold]);

  const handlePressEnd = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    
    // Si hay una reacción activa, aplicarla cuando se levante el dedo/ratón
    if (activeReaction && showReactions) {
      handleReactionClick(activeReaction);
    }
  }, [activeReaction, handleReactionClick, showReactions]);

  // Handle click on the main button (non-long press)
  const handleButtonClick = useCallback(async () => {
    if (!showReactions && userReaction) {
      handleReactionClick(userReaction);
    }
  }, [handleReactionClick, showReactions, userReaction]);

  // Clean up timer if component unmounts while timer is active
  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
  }, []);

  return {
    isSubmitting,
    showReactions,
    activeReaction,
    setActiveReaction,
    setShowReactions,
    handlePressStart,
    handlePressEnd,
    handleButtonClick,
    handleReactionClick
  };
}
