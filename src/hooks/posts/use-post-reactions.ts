
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReactionType } from "@/types/database/social.types";

/**
 * Hook for managing post reactions
 */
export function usePostReactions(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { mutate: reactToPost } = useMutation({
    mutationFn: async ({ postId, type }: { postId: string; type: ReactionType }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para reaccionar");
      
      const { data: existingReaction } = await supabase
        .from("reactions")
        .select("id, reaction_type")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (existingReaction) {
        if (existingReaction.reaction_type === type) {
          await supabase
            .from("reactions")
            .delete()
            .eq("id", existingReaction.id);
        } else {
          await supabase
            .from("reactions")
            .update({ reaction_type: type })
            .eq("id", existingReaction.id);
        }
      } else {
        await supabase
          .from("reactions")
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: type
          });
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar la reacción",
      });
    }
  });
  
  const onReaction = (postId: string, type: ReactionType) => {
    reactToPost({ postId, type });
  };
  
  return { onReaction };
}
