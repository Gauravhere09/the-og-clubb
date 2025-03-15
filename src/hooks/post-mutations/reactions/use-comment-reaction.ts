
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CommentReactionParams } from "../types";

/**
 * Hook for managing comment reactions
 */
export function useCommentReaction(postId: string, checkAuth: (showToast?: boolean) => Promise<boolean>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: toggleCommentReaction } = useMutation({
    mutationFn: async ({ commentId, type }: CommentReactionParams) => {
      console.log(`Toggling reaction ${type} for comment ${commentId}`);
      
      // Check authentication first without showing a toast (we'll show it later if needed)
      const isAuthenticated = await checkAuth(false);
      
      if (!isAuthenticated) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
        });
        throw new Error("Debes iniciar sesión para reaccionar");
      }
      
      const { data } = await supabase.auth.getSession();
      
      if (!data.session?.user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
        });
        throw new Error("Debes iniciar sesión para reaccionar");
      }
      
      const { data: existingReaction } = await supabase
        .from('reactions')
        .select()
        .eq('user_id', data.session.user.id)
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
            user_id: data.session.user.id,
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

  return { toggleCommentReaction };
}
