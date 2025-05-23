
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function usePollVoteMutation(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: submitVote, isPending } = useMutation({
    mutationFn: async (optionId: string) => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.user) {
        throw new Error("Debes iniciar sesión para votar");
      }
      
      // Verificar si el usuario ya ha votado en esta encuesta
      const { data: existingVotes, error: checkError } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentSession.user.id);
        
      if (checkError) throw checkError;
      
      if (existingVotes && existingVotes.length > 0) {
        throw new Error("Ya has votado en esta encuesta");
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
      const { data: postData, error: fetchError } = await supabase
        .from('posts')
        .select('poll')
        .eq('id', postId)
        .single();
        
      if (fetchError) throw fetchError;
      
      if (postData && postData.poll) {
        const updatedPoll = JSON.parse(JSON.stringify(postData.poll));
        updatedPoll.total_votes = (updatedPoll.total_votes || 0) + 1;
        
        const optionIndex = updatedPoll.options.findIndex((opt: any) => opt.id === optionId);
        if (optionIndex >= 0) {
          updatedPoll.options[optionIndex].votes = (updatedPoll.options[optionIndex].votes || 0) + 1;
        }
        
        // Add the user's vote to the poll
        updatedPoll.user_vote = optionId;
        
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
      console.error("Error voting:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo registrar tu voto",
      });
    },
  });

  return { submitVote, isPending };
}
