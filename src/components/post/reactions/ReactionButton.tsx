
import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { reactionIcons, type ReactionType } from "./ReactionIcons";

interface ReactionButtonProps {
  userReaction?: ReactionType;
  onReactionClick: (type: ReactionType) => void;
}

export function ReactionButton({ userReaction, onReactionClick }: ReactionButtonProps) {
  const handleReactionClick = (type: ReactionType) => {
    onReactionClick(type);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`${userReaction ? reactionIcons[userReaction].color : ''} group`}
          onClick={() => userReaction && handleReactionClick(userReaction)}
        >
          {userReaction ? (
            <div className="flex items-center">
              {userReaction === 'surprised' ? (
                reactionIcons.surprised.icon()
              ) : (
                <div className={reactionIcons[userReaction].color}>
                  {React.createElement(reactionIcons[userReaction].icon, {
                    className: "h-4 w-4 mr-2"
                  })}
                </div>
              )}
              {reactionIcons[userReaction].label}
            </div>
          ) : (
            <div className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Me gusta
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-fit p-2" 
        side="top"
        align="start"
        sideOffset={5}
      >
        <div className="flex gap-1">
          {Object.entries(reactionIcons).map(([type, { icon: Icon, color, label }]) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className={`hover:${color} ${userReaction === type ? color : ''} relative group hover:scale-125 transition-transform duration-200`}
              onClick={() => handleReactionClick(type as ReactionType)}
            >
              {type === 'surprised' ? (
                <Icon />
              ) : (
                <Icon className={`h-6 w-6 ${userReaction === type ? color : ''}`} />
              )}
              <span className="absolute -top-8 scale-0 transition-all rounded bg-black px-2 py-1 text-xs text-white group-hover:scale-100 whitespace-nowrap">
                {label}
              </span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
