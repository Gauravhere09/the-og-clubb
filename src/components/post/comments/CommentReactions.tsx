
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThumbsUp, Heart, Laugh, Angry } from "lucide-react";
import { type ReactionType } from "@/types/database/social.types";

const reactionIcons = {
  'like': <ThumbsUp className="h-3 w-3" />,
  'love': <Heart className="h-3 w-3 text-red-500" />,
  'haha': <Laugh className="h-3 w-3 text-yellow-500" />,
  'wow': <svg className="h-3 w-3 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="4" fill="currentColor"/>
    <circle cx="8" cy="9" r="1.5" fill="currentColor"/>
    <circle cx="16" cy="9" r="1.5" fill="currentColor"/>
  </svg>,
  'sad': <svg className="h-3 w-3 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" fill="none"/>
    <circle cx="8.5" cy="10" r="1.5" fill="white"/>
    <circle cx="15.5" cy="10" r="1.5" fill="white"/>
  </svg>,
  'angry': <Angry className="h-3 w-3 text-orange-500" />
} as const;

interface CommentReactionsProps {
  commentId: string;
  userReaction: ReactionType | null;
  reactionsCount: number;
  onReaction: (commentId: string, type: ReactionType) => void;
}

export function CommentReactions({ 
  commentId, 
  userReaction, 
  reactionsCount, 
  onReaction 
}: CommentReactionsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-auto p-0 text-xs ${userReaction ? 'text-primary' : ''}`}
        >
          {userReaction ? reactionIcons[userReaction] : reactionIcons['like']}
          <span className="ml-1">{reactionsCount}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-2" align="start">
        <div className="flex gap-1">
          {Object.entries(reactionIcons).map(([type, icon]) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${userReaction === type ? 'text-primary' : ''}`}
              onClick={() => onReaction(commentId, type as ReactionType)}
            >
              {icon}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
