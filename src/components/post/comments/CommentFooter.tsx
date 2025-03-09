
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { CommentReactions } from "./CommentReactions";
import type { ReactionType } from "@/types/database/social.types";

interface CommentFooterProps {
  commentId: string;
  userReaction: ReactionType | null;
  reactionsCount: number;
  onReaction: (commentId: string, type: ReactionType) => void;
  onReply: () => void;
}

export function CommentFooter({ 
  commentId, 
  userReaction, 
  reactionsCount, 
  onReaction, 
  onReply 
}: CommentFooterProps) {
  return (
    <div className="flex items-center gap-3 mt-0.5">
      <CommentReactions
        commentId={commentId}
        userReaction={userReaction}
        reactionsCount={reactionsCount}
        onReaction={onReaction}
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 text-xs flex items-center gap-1"
        onClick={onReply}
      >
        <MessageSquare className="h-3 w-3" />
        Responder
      </Button>
    </div>
  );
}
