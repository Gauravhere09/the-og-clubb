
import React from "react";
import { reactionIcons } from "./ReactionIcons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReactionSummaryProps {
  reactions: Record<string, number>;
}

export function ReactionSummary({ reactions }: ReactionSummaryProps) {
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  const sortedReactions = Object.entries(reactions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-pointer">
            <div className="flex -space-x-1">
              {sortedReactions.map(([type]) => {
                const Icon = reactionIcons[type as keyof typeof reactionIcons]?.icon;
                if (!Icon) return null;
                
                return (
                  <div 
                    key={type}
                    className={`${reactionIcons[type as keyof typeof reactionIcons].color} w-4 h-4 rounded-full shadow-sm flex items-center justify-center bg-background border border-background`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                );
              })}
            </div>
            <span className="text-sm text-muted-foreground">
              {totalReactions}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {Object.entries(reactions).map(([type, count]) => {
            const ReactionIcon = reactionIcons[type as keyof typeof reactionIcons]?.icon;
            if (!ReactionIcon) return null;

            return (
              <div key={type} className="flex items-center gap-1">
                <div className={reactionIcons[type as keyof typeof reactionIcons].color}>
                  <ReactionIcon className="w-3 h-3" />
                </div>
                <span>{count}</span>
                <span>{reactionIcons[type as keyof typeof reactionIcons].label}</span>
              </div>
            );
          })}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
