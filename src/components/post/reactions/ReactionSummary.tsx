
import React from "react";
import { reactionIcons } from "./ReactionIcons";

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
          const Icon = reactionIcons[type as keyof typeof reactionIcons]?.icon;
          if (!Icon) return null;
          
          return (
            <div 
              key={type}
              style={{ backgroundColor: 'white' }}
              className="w-4 h-4 rounded-full shadow-sm flex items-center justify-center"
            >
              <Icon className="w-3 h-3" />
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
