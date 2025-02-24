
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Poll } from "@/types/post";
import { Progress } from "@/components/ui/progress";

interface PollDisplayProps {
  poll: Poll;
  onVote: (optionId: string) => void;
}

export function PollDisplay({ poll, onVote }: PollDisplayProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(poll.user_vote);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (optionId: string) => {
    if (poll.user_vote || isVoting) return;
    setIsVoting(true);
    await onVote(optionId);
    setSelectedOption(optionId);
    setIsVoting(false);
  };

  const getPercentage = (votes: number) => {
    if (poll.total_votes === 0) return 0;
    return Math.round((votes / poll.total_votes) * 100);
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="font-medium text-lg">{poll.question}</h3>
      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.votes);
          const isSelected = option.id === selectedOption;
          const hasVoted = poll.user_vote !== null;

          return (
            <div
              key={option.id}
              className={`relative ${!hasVoted && 'hover:bg-accent'} rounded-lg transition-colors`}
            >
              <Button
                variant={isSelected ? "secondary" : "outline"}
                className="w-full justify-start"
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || isVoting}
              >
                {option.content}
              </Button>
              {hasVoted && (
                <div className="mt-1">
                  <Progress value={percentage} className="h-2" />
                  <span className="text-sm text-muted-foreground">
                    {percentage}% ({option.votes} votos)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        {poll.total_votes} votos totales
      </p>
    </div>
  );
}
