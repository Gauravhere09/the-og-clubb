
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
  disabled?: boolean;
  userVote?: string | null; // Added this prop
}

export function PollDisplay({ postId, poll, onVote, disabled = false, userVote }: PollDisplayProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(userVote || poll.user_vote);
  const [showVotesDialog, setShowVotesDialog] = useState(false);
  const [votes, setVotes] = useState<VoteWithUser[]>([]);
  const { toast } = useToast();
  const { submitVote, isPending } = usePollVoteMutation(postId);

  const handleVote = async (optionId: string) => {
    if (poll.user_vote || isPending || disabled) return;
    
    try {
      if (onVote) {
        await onVote(optionId);
      } else {
        // Default voting behavior
        submitVote(optionId);
      }
      
      setSelectedOption(optionId);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al votar",
        description: error.message || "No se pudo registrar tu voto",
      });
    }
  };

  const getPercentage = (votes: number) => {
    if (poll.total_votes === 0) return 0;
    // Ensure we get a whole number percentage and avoid returning 0% when there are votes
    return Math.max(1, Math.round((votes / poll.total_votes) * 100));
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
      
      // Filter out duplicates
      const uniqueVotes = new Map();
      (votesData as VoteWithUser[]).forEach(vote => {
        const key = `${vote.profiles.username}-${vote.option_id}`;
        uniqueVotes.set(key, vote);
      });
      
      setVotes(Array.from(uniqueVotes.values()) as VoteWithUser[]);
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
        {!poll.user_vote && !userVote && !disabled && (
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
            votes={option.votes || 0}
            percentage={getPercentage(option.votes || 0)}
            isSelected={option.id === selectedOption}
            hasVoted={poll.user_vote !== null || userVote !== null || disabled}
            isVoting={isPending}
            onVote={handleVote}
          />
        ))}
      </div>

      {(poll.user_vote || userVote) && (
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
