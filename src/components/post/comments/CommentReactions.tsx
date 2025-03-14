
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { reactionIcons, type ReactionType } from "@/components/post/reactions/ReactionIcons";

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
          {userReaction ? 
            <div className={userReaction && reactionIcons[userReaction].color}>
              {reactionIcons[userReaction].icon({ className: "h-3 w-3" })}
            </div> : 
            <div className="text-muted-foreground">
              {reactionIcons.like.icon({ className: "h-3 w-3" })}
            </div>
          }
          <span className="ml-1">{reactionsCount}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-2" align="start">
        <div className="flex gap-1">
          {Object.entries(reactionIcons).map(([type, { icon, color }]) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${userReaction === type ? color : ''}`}
              onClick={() => onReaction(commentId, type as ReactionType)}
            >
              {icon({ className: "h-4 w-4" })}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
