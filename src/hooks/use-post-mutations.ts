import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";
import { toggleReaction, ReactionType } from "@/lib/api/likes";
import type { Database } from "@/types/database";

type Reaction = Database["public"]["Tables"]["reactions"]["Row"];

export function usePostMutations(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const session = useSession();

  const { mutate: handleReaction } = useMutation({
    mutationFn: async (type: ReactionType) => {
      if (!session?.user?.id) {
        throw new Error("Debes iniciar sesión para reaccionar");
      }

      const { data: existingReaction } = await supabase
        .from("reactions")
        .select()
        .eq("user_id", session.user.id)
        .eq("post_id", postId)
        .single<Reaction>();

      if (existingReaction) {
        if (existingReaction.reaction_type === type) {
          const { error } = await supabase
            .from("reactions")
            .delete()
            .eq("id", existingReaction.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("reactions")
            .update({ reaction_type: type })
            .eq("id", existingReaction.id);
          if (error) throw error;
        }
      } else {
        const { error } = await supabase
          .from("reactions")
          .insert({
            user_id: session.user.id,
            post_id: postId,
            reaction_type: type
          });
        if (error) throw error;
      }
      
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onSuccess: () => {
      toast({
        title: "Reacción actualizada",
        description: "Tu reacción se ha actualizado correctamente",
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

  const { mutate: handleDeletePost } = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Post eliminado",
        description: "El post se ha eliminado correctamente",
      });
    }
  });

  const { mutate: toggleCommentReaction } = useMutation({
    mutationFn: async ({ commentId, type }: { commentId: string; type: ReactionType }) => {
      if (!session?.user?.id) {
        throw new Error("Debes iniciar sesión para reaccionar");
      }
      
      const { data: existingReaction } = await supabase
        .from('reactions')
        .select()
        .eq('user_id', session.user.id)
        .eq('comment_id', commentId)
        .single<Reaction>();

      if (existingReaction) {
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('id', existingReaction.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reactions')
          .insert({
            user_id: session.user.id,
            comment_id: commentId,
            post_id: null,
            reaction_type: type
          });
        if (error) throw error;
      }
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
    handleDeletePost,
    toggleCommentReaction
  };
}
