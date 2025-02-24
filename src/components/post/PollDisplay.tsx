
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Poll } from "@/types/post";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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
    <div className="space-y-4 mt-4 bg-muted/30 p-4 rounded-lg">
      <h3 className="font-semibold text-lg border-b pb-2">
        {poll.question}
      </h3>
      <div className="space-y-3">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.votes);
          const isSelected = option.id === selectedOption;
          const hasVoted = poll.user_vote !== null;

          return (
            <div
              key={option.id}
              className="relative"
            >
              <div
                className={cn(
                  "relative z-10",
                  hasVoted && "pointer-events-none"
                )}
              >
                <button
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted || isVoting}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg transition-all",
                    "relative z-10 bg-transparent",
                    !hasVoted && "hover:bg-accent",
                    isSelected && "font-semibold"
                  )}
                >
                  <div className="relative z-10 flex justify-between items-center">
                    <span>{option.content}</span>
                    {hasVoted && (
                      <span className="text-sm font-medium">
                        {percentage}%
                      </span>
                    )}
                  </div>
                </button>
                {hasVoted && (
                  <div 
                    className={cn(
                      "absolute inset-0 rounded-lg",
                      isSelected ? "bg-primary/20" : "bg-muted",
                      "transition-all duration-500 ease-out"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-sm text-muted-foreground pt-2 border-t">
        {poll.total_votes} {poll.total_votes === 1 ? "voto" : "votos"}
        {poll.user_vote && " • Ya has votado"}
      </div>
    </div>
  );
}
