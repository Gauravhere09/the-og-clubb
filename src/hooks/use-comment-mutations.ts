
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useCommentMutations(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: submitComment } = useMutation({
    mutationFn: async ({ content, replyToId }: { content: string; replyToId?: string }) => {
      if (!content.trim()) throw new Error("El comentario no puede estar vacío");
      return createComment(postId, content, replyToId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast({
        title: "Comentario añadido",
        description: "Tu comentario se ha publicado correctamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al publicar el comentario",
      });
    },
  });

  const { mutate: deleteComment } = useMutation({
    mutationFn: async (commentId: string) => {
      // Comprobar que el usuario es el dueño del comentario
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Debes iniciar sesión para eliminar un comentario");
      }
      
      // Obtener el comentario para verificar la propiedad
      const { data: comment } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', commentId)
        .single();
      
      if (!comment) {
        throw new Error("Comentario no encontrado");
      }
      
      if (comment.user_id !== user.id) {
        throw new Error("No tienes permiso para eliminar este comentario");
      }
      
      // Eliminar el comentario
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
        
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast({
        title: "Comentario eliminado",
        description: "El comentario se ha eliminado correctamente",
      });
    },
    onError: (error) => {
      console.error("Error deleting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el comentario",
      });
    },
  });

  const { mutate: editComment } = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      // Comprobar que el usuario es el dueño del comentario
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Debes iniciar sesión para editar un comentario");
      }
      
      // Obtener el comentario para verificar la propiedad
      const { data: comment } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', commentId)
        .single();
      
      if (!comment) {
        throw new Error("Comentario no encontrado");
      }
      
      if (comment.user_id !== user.id) {
        throw new Error("No tienes permiso para editar este comentario");
      }
      
      const { error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', commentId);
        
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast({
        title: "Comentario actualizado",
        description: "El comentario se ha actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el comentario",
      });
    },
  });

  return {
    submitComment,
    deleteComment,
    editComment
  };
}
