
import React from "react";
import { Post } from "@/types/post";
import { ReactionSummaryDialog } from "./ReactionSummaryDialog";
import { CommentsCount } from "./CommentsCount";

interface ActionsSummaryProps {
  totalReactions: number;
  reactionsByType: Record<string, number>;
  post: Post;
  commentCount: number;
  onCommentsClick: () => void;
  commentsExpanded: boolean;
}

export function ActionsSummary({ 
  totalReactions, 
  reactionsByType, 
  post,
  commentCount,
  onCommentsClick,
  commentsExpanded
}: ActionsSummaryProps) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
      {totalReactions > 0 && (
        <ReactionSummaryDialog reactions={reactionsByType} post={post} />
      )}
      
      {commentCount > 0 && (
        <CommentsCount 
          count={commentCount} 
          onClick={onCommentsClick} 
          isExpanded={commentsExpanded}
        />
      )}
    </div>
  );
}
