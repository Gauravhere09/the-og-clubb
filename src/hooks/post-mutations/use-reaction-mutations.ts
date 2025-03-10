
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReactionType } from "@/types/database/social.types";
import { CommentReactionParams } from "./types";

export function useReactionMutations(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const mutationInProgressRef = React.useRef(false);

  const { mutate: handleReaction } = useMutation({
    mutationFn: async (type: ReactionType) => {
      // Prevent multiple simultaneous reactions
      if (mutationInProgressRef.current) return;
      mutationInProgressRef.current = true;
      
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession?.user) {
          throw new Error("Debes iniciar sesión para reaccionar");
        }

        const { data: existingReactions, error: fetchError } = await supabase
          .from("reactions")
          .select()
          .eq("user_id", currentSession.user.id)
          .eq("post_id", postId);

        if (fetchError) throw fetchError;

        // Handling reactions without updating UI prematurely
        if (existingReactions && existingReactions.length > 0) {
          if (existingReactions[0].reaction_type === type) {
            // Remove reaction if clicking the same one
            const { error } = await supabase
              .from("reactions")
              .delete()
              .eq("id", existingReactions[0].id);
            if (error) throw error;
          } else {
            // Replace with new reaction
            const { error } = await supabase
              .from("reactions")
              .update({ reaction_type: type })
              .eq("id", existingReactions[0].id);
            if (error) throw error;
          }
        } else {
          // Create new reaction
          const { error } = await supabase
            .from("reactions")
            .insert({
              user_id: currentSession.user.id,
              post_id: postId,
              reaction_type: type
            });
          if (error) throw error;
        }
        
        // Only invalidate queries after DB operation is complete
        await queryClient.invalidateQueries({ queryKey: ["posts"] });
        return type;
      } finally {
        mutationInProgressRef.current = false;
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar la reacción",
      });
      mutationInProgressRef.current = false;
    },
  });

  const { mutate: toggleCommentReaction } = useMutation({
    mutationFn: async ({ commentId, type }: CommentReactionParams) => {
      console.log(`Toggling reaction ${type} for comment ${commentId}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Debes iniciar sesión para reaccionar");
      }
      
      const { data: existingReaction } = await supabase
        .from('reactions')
        .select()
        .eq('user_id', user.id)
        .eq('comment_id', commentId)
        .maybeSingle();

      if (existingReaction) {
        if (existingReaction.reaction_type === type) {
          console.log(`Removing existing ${type} reaction`);
          const { error } = await supabase
            .from('reactions')
            .delete()
            .eq('id', existingReaction.id);
          if (error) throw error;
        } else {
          console.log(`Updating reaction from ${existingReaction.reaction_type} to ${type}`);
          const { error } = await supabase
            .from('reactions')
            .update({ reaction_type: type })
            .eq('id', existingReaction.id);
          if (error) throw error;
        }
      } else {
        console.log(`Creating new ${type} reaction`);
        const { error } = await supabase
          .from('reactions')
          .insert({
            user_id: user.id,
            comment_id: commentId,
            reaction_type: type
          });
        if (error) throw error;
      }

      // Invalidate after successful operation
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });

      toast({
        title: "Reacción actualizada",
        description: "Tu reacción ha sido registrada",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar la reacción",
      });
    },
  });

  return {
    handleReaction,
    toggleCommentReaction
  };
}
