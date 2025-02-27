
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function usePollVoteMutation(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: submitVote } = useMutation({
    mutationFn: async (optionId: string) => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.user) {
        throw new Error("Debes iniciar sesión para votar");
      }
      
      // Insert vote
      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert({
          post_id: postId,
          option_id: optionId,
          user_id: currentSession.user.id
        });
        
      if (voteError) throw voteError;
      
      // Update poll in the post
      const { data: postData } = await supabase
        .from('posts')
        .select('poll')
        .eq('id', postId)
        .single();
        
      if (postData && postData.poll) {
        const updatedPoll = { ...postData.poll };
        updatedPoll.total_votes = (updatedPoll.total_votes || 0) + 1;
        
        const optionIndex = updatedPoll.options.findIndex((opt: any) => opt.id === optionId);
        if (optionIndex >= 0) {
          updatedPoll.options[optionIndex].votes = (updatedPoll.options[optionIndex].votes || 0) + 1;
        }
        
        const { error: updateError } = await supabase
          .from('posts')
          .update({ poll: updatedPoll })
          .eq('id', postId);
          
        if (updateError) throw updateError;
      }
      
      return optionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Voto registrado",
        description: "Tu voto ha sido registrado correctamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo registrar tu voto",
      });
    },
  });

  return { submitVote };
}
