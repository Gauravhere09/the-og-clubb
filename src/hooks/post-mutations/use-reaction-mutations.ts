
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

        if (existingReactions && existingReactions.length > 0) {
          if (existingReactions[0].reaction_type === type) {
            const { error } = await supabase
              .from("reactions")
              .delete()
              .eq("id", existingReactions[0].id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from("reactions")
              .delete()
              .eq("id", existingReactions[0].id);
            if (error) throw error;

            const { error: insertError } = await supabase
              .from("reactions")
              .insert({
                user_id: currentSession.user.id,
                post_id: postId,
                reaction_type: type
              });
            if (insertError) throw insertError;
          }
        } else {
          const { error } = await supabase
            .from("reactions")
            .insert({
              user_id: currentSession.user.id,
              post_id: postId,
              reaction_type: type
            });
          if (error) throw error;
        }
        
        await queryClient.invalidateQueries({ queryKey: ["posts"] });
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

      toast({
        title: "Reacción actualizada",
        description: "Tu reacción ha sido registrada",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
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
