
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThumbsUp, Heart, Laugh, Angry, Sigma } from "lucide-react";

const reactionIcons = {
  'like': <ThumbsUp className="h-3 w-3" />,
  'love': <Heart className="h-3 w-3 text-red-500" />,
  'haha': <Laugh className="h-3 w-3 text-yellow-500" />,
  'angry': <Angry className="h-3 w-3 text-orange-500" />,
  'surprised': <svg className="h-3 w-3 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="4" fill="currentColor"/>
    <circle cx="8" cy="9" r="1.5" fill="currentColor"/>
    <circle cx="16" cy="9" r="1.5" fill="currentColor"/>
  </svg>,
  'sigma': <Sigma className="h-3 w-3 text-gray-700" />
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
