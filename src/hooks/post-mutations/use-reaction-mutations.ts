
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReactionType } from "@/types/database/social.types";
import { CommentReactionParams } from "./types";

export function useReactionMutations(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: handleReaction } = useMutation({
    mutationFn: async (type: ReactionType) => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.user) {
        throw new Error("Debes iniciar sesión para reaccionar");
      }

      // Obtener reacción existente
      const { data: existingReactions, error: fetchError } = await supabase
        .from("reactions")
        .select()
        .eq("user_id", currentSession.user.id)
        .eq("post_id", postId);

      if (fetchError) throw fetchError;

      // Si ya existe una reacción del mismo tipo, la eliminamos
      if (existingReactions && existingReactions.length > 0) {
        if (existingReactions[0].reaction_type === type) {
          const { error } = await supabase
            .from("reactions")
            .delete()
            .eq("id", existingReactions[0].id);
          if (error) throw error;
        } else {
          // Si existe una reacción diferente, la actualizamos
          const { error } = await supabase
            .from("reactions")
            .delete()
            .eq("id", existingReactions[0].id);
          if (error) throw error;

          // Crear nueva reacción
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
        // Si no existe ninguna reacción, creamos una nueva
        const { error } = await supabase
          .from("reactions")
          .insert({
            user_id: currentSession.user.id,
            post_id: postId,
            reaction_type: type
          });
        if (error) throw error;
      }
      
      // Invalidar la cache inmediatamente para forzar una actualización
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar la reacción",
      });
    },
  });

  const { mutate: toggleCommentReaction } = useMutation({
    mutationFn: async ({ commentId, type }: CommentReactionParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Debes iniciar sesión para reaccionar");
      }
      
      // Buscar si existe una reacción previa del usuario en este comentario
      const { data: existingReaction } = await supabase
        .from('reactions')
        .select()
        .eq('user_id', user.id)
        .eq('comment_id', commentId)
        .maybeSingle();

      if (existingReaction) {
        // Si es la misma reacción, la eliminamos (toggle)
        if (existingReaction.reaction_type === type) {
          const { error } = await supabase
            .from('reactions')
            .delete()
            .eq('id', existingReaction.id);
          if (error) throw error;
        } else {
          // Si es una reacción diferente, la actualizamos
          const { error } = await supabase
            .from('reactions')
            .update({ reaction_type: type })
            .eq('id', existingReaction.id);
          if (error) throw error;
        }
      } else {
        // Si no existe reacción previa, creamos una nueva
        const { error } = await supabase
          .from('reactions')
          .insert({
            user_id: user.id,
            comment_id: commentId,
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
    toggleCommentReaction
  };
}
