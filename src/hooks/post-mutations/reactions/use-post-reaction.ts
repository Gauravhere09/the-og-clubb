
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReactionType } from "@/types/database/social.types";

/**
 * Hook for managing post reactions
 */
export function usePostReaction(postId: string, checkAuth: (showToast?: boolean) => Promise<boolean>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const mutationInProgressRef = React.useRef(false);

  const { mutate: handleReaction } = useMutation({
    mutationFn: async (type: ReactionType) => {
      // Prevent multiple simultaneous reactions
      if (mutationInProgressRef.current) return;
      mutationInProgressRef.current = true;
      
      try {
        // Check authentication first
        const isAuthenticated = await checkAuth();
        
        if (!isAuthenticated) {
          throw new Error("Debes iniciar sesión para reaccionar");
        }

        const { data } = await supabase.auth.getSession();
        
        if (!data.session?.user) {
          throw new Error("Debes iniciar sesión para reaccionar");
        }

        const { data: existingReactions, error: fetchError } = await supabase
          .from("reactions")
          .select()
          .eq("user_id", data.session.user.id)
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
              user_id: data.session.user.id,
              post_id: postId,
              reaction_type: type
            });
          if (error) throw error;
        }
        
        // Only invalidate queries after DB operation is complete
        await queryClient.invalidateQueries({ queryKey: ["posts"] });
        return type;
      } catch (error) {
        console.error("Error handling reaction:", error);
        throw error;
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
    },
  });

  return { handleReaction };
}
