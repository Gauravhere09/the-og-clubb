
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactionType } from "../ReactionIcons";

interface UseReactionHandlerProps {
  postId: string;
  userReaction?: ReactionType;
  onReactionClick: (type: ReactionType) => void;
  validateSession: () => Promise<any>;
}

export function useReactionHandler({
  postId,
  userReaction,
  onReactionClick,
  validateSession
}: UseReactionHandlerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize the reaction handler to prevent unnecessary re-renders
  const handleReactionClick = useCallback(async (type: ReactionType) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const user = await validateSession();
      if (!user) {
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
          .eq('user_id', user.id);

        if (error) throw error;
        
        // Only update UI after successful database operation
        onReactionClick(type);
      } else {
        // First delete any existing reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        // Then insert the new reaction
        const { error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
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
    }
  }, [isSubmitting, onReactionClick, postId, queryClient, toast, userReaction, validateSession]);

  return {
    isSubmitting,
    handleReactionClick
  };
}
