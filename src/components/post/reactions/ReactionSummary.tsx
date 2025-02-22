
import React from "react";
import { reactionIcons, type ReactionType } from "./ReactionIcons";

interface ReactionSummaryProps {
  reactions: Record<string, number>;
}

export function ReactionSummary({ reactions }: ReactionSummaryProps) {
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  const sortedReactions = Object.entries(reactions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-1">
        {sortedReactions.map(([type]) => {
          const ReactionIcon = reactionIcons[type as ReactionType].icon;
          return (
            <div 
              key={type}
              className={`w-4 h-4 rounded-full bg-background shadow-sm flex items-center justify-center ${reactionIcons[type as ReactionType].color}`}
            >
              <ReactionIcon className="w-3 h-3" />
            </div>
          );
        })}
      </div>
      <span className="text-sm text-muted-foreground">
        {totalReactions} {totalReactions === 1 ? 'reacción' : 'reacciones'}
      </span>
    </div>
  );
}
