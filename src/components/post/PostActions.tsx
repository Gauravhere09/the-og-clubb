
import React from "react";
import { Button } from "@/components/ui/button";
import type { Post } from "@/types/post";
import { ReactionButton } from "./reactions/ReactionButton";
import { type ReactionType } from "./reactions/ReactionIcons";
import { ShareOptions } from "./actions/ShareOptions";
import { ReactionSummaryDialog } from "./actions/ReactionSummaryDialog";
import { CommentsCount } from "./actions/CommentsCount";
import { CommentButton } from "./actions/CommentButton";

interface PostActionsProps {
  post: Post;
  onReaction: (type: ReactionType) => void;
  onToggleComments: () => void;
  onCommentsClick: () => void;
}

export function PostActions({ 
  post, 
  onReaction, 
  onToggleComments,
  onCommentsClick 
}: PostActionsProps) {
  const reactionsByType = post.reactions?.by_type || {};
  const userReaction = post.user_reaction as ReactionType | undefined;
  const totalReactions = Object.values(reactionsByType).reduce((sum, count) => sum + count, 0);
  const commentCount = post.comments_count || 0;
  const [showShareOptions, setShowShareOptions] = React.useState(false);

  // Manejador local para evitar duplicación de actualizaciones de UI
  const handleReaction = (type: ReactionType) => {
    onReaction(type);
  };

  return (
    <div className="space-y-2">
      {/* Interactions Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        {totalReactions > 0 && (
          <ReactionSummaryDialog reactions={reactionsByType} post={post} />
        )}
        
        {commentCount > 0 && (
          <CommentsCount count={commentCount} onClick={onCommentsClick} />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 border-t border-b py-1">
        <ReactionButton 
          userReaction={userReaction} 
          onReactionClick={handleReaction}
          postId={post.id}
        />

        <CommentButton onToggleComments={onToggleComments} />

        <ShareOptions 
          post={post} 
          open={showShareOptions} 
          onOpenChange={setShowShareOptions} 
        />
      </div>
    </div>
  );
}
