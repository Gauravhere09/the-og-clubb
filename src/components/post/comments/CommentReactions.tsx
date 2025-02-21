
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThumbsUp, Heart, SmilePlus, Frown, Angry } from "lucide-react";

const reactionIcons = {
  'like': <ThumbsUp className="h-3 w-3" />,
  'love': <Heart className="h-3 w-3 text-red-500" />,
  'haha': <SmilePlus className="h-3 w-3 text-yellow-500" />,
  'sad': <Frown className="h-3 w-3 text-blue-500" />,
  'angry': <Angry className="h-3 w-3 text-orange-500" />
} as const;

interface CommentReactionsProps {
  commentId: string;
  userReaction: keyof typeof reactionIcons | null;
  reactionsCount: number;
  onReaction: (commentId: string, type: keyof typeof reactionIcons) => void;
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
          {reactionIcons[userReaction || 'like']}
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
              className="h-8 w-8 p-0"
              onClick={() => onReaction(commentId, type as keyof typeof reactionIcons)}
            >
              {icon}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
