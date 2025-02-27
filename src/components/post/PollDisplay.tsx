
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Poll } from "@/types/post";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { usePollVoteMutation } from "@/hooks/post-mutations/use-poll-vote-mutation";
import { PollOption } from "./poll/PollOption";
import { VotesDialog } from "./poll/VotesDialog";
import { VoteWithUser } from "./poll/VotersList";

interface PollDisplayProps {
  postId: string;
  poll: Poll;
  onVote?: (optionId: string) => Promise<void>;
}

export function PollDisplay({ postId, poll, onVote }: PollDisplayProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(poll.user_vote);
  const [isVoting, setIsVoting] = useState(false);
  const [showVotesDialog, setShowVotesDialog] = useState(false);
  const [votes, setVotes] = useState<VoteWithUser[]>([]);
  const { toast } = useToast();
  const { submitVote } = usePollVoteMutation(postId);

  const handleVote = async (optionId: string) => {
    if (poll.user_vote || isVoting) return;
    
    setIsVoting(true);
    try {
      if (onVote) {
        await onVote(optionId);
      } else {
        // Default voting behavior
        await submitVote(optionId);
      }
      
      setSelectedOption(optionId);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al votar",
        description: error.message || "No se pudo registrar tu voto",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const getPercentage = (votes: number) => {
    if (poll.total_votes === 0) return 0;
    return Math.round((votes / poll.total_votes) * 100);
  };

  const loadVotes = async () => {
    try {
      const { data: votesData, error } = await supabase
        .from('poll_votes')
        .select(`
          option_id,
          profiles (
            username,
            avatar_url
          ),
          created_at
        `)
        .eq('post_id', postId);

      if (error) throw error;
      setVotes(votesData as VoteWithUser[]);
    } catch (error) {
      console.error('Error loading votes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los votos",
      });
    }
  };

  return (
    <div className="space-y-4 mt-4 bg-background rounded-lg p-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">
          {poll.question}
        </h3>
        {!poll.user_vote && (
          <p className="text-sm text-muted-foreground">
            Selecciona una opción.
          </p>
        )}
      </div>

      <div className="space-y-3">
        {poll.options.map((option) => (
          <PollOption
            key={option.id}
            id={option.id}
            content={option.content}
            votes={option.votes}
            percentage={getPercentage(option.votes)}
            isSelected={option.id === selectedOption}
            hasVoted={poll.user_vote !== null}
            isVoting={isVoting}
            onVote={handleVote}
          />
        ))}
      </div>

      {poll.user_vote && (
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
          <span>{poll.total_votes} {poll.total_votes === 1 ? "voto" : "votos"}</span>
          <VotesDialog
            poll={poll}
            votes={votes}
            open={showVotesDialog}
            onOpenChange={setShowVotesDialog}
            onLoadVotes={loadVotes}
            getPercentage={getPercentage}
          />
        </div>
      )}
    </div>
  );
}
