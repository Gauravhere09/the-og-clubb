
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PollOptionProps {
  id: string;
  content: string;
  votes: number;
  percentage: number;
  isSelected: boolean;
  hasVoted: boolean;
  isVoting: boolean;
  onVote: (optionId: string) => void;
}

export function PollOption({
  id,
  content,
  votes,
  percentage,
  isSelected,
  hasVoted,
  isVoting,
  onVote,
}: PollOptionProps) {
  return (
    <div className="relative">
      <button
        onClick={() => onVote(id)}
        disabled={hasVoted || isVoting}
        className={cn(
          "w-full text-left p-4 rounded-lg transition-all relative overflow-hidden",
          "group flex items-center justify-between",
          hasVoted ? "bg-primary/10" : "hover:bg-primary/5",
          isSelected && "bg-primary/20"
        )}
      >
        <div className="flex items-center gap-3 z-10">
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              isSelected ? "border-primary bg-primary" : "border-muted-foreground"
            )}
          >
            {isSelected && <Check className="h-3 w-3 text-white" />}
          </div>
          <span
            className={cn(
              "font-medium",
              isSelected && "text-primary"
            )}
          >
            {content}
          </span>
        </div>
        {hasVoted && (
          <span className="text-sm font-medium z-10">
            {percentage}% ({votes || 0})
          </span>
        )}
        {hasVoted && (
          <div
            className={cn(
              "absolute inset-0 rounded-lg bg-primary/5",
              isSelected && "bg-primary/10"
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </button>
    </div>
  );
}
