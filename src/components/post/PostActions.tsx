
import React from "react";
import { Button } from "@/components/ui/button";
import type { Post } from "@/types/post";
import { type ReactionType } from "./reactions/ReactionIcons";
import { ShareOptions } from "./actions/ShareOptions";
import { ReactionSummaryDialog } from "./actions/ReactionSummaryDialog";
import { CommentsCount } from "./actions/CommentsCount";
import { CommentButton } from "./actions/CommentButton";
import { LongPressReactionButton } from "./reactions/LongPressReactionButton";
import { Share } from "lucide-react";
import { useLongPress } from "./reactions/hooks/use-long-press";

interface PostActionsProps {
  post: Post;
  onReaction: (type: ReactionType) => void;
  onToggleComments: () => void;
  onCommentsClick: () => void;
  commentsExpanded?: boolean;
}

export function PostActions({ 
  post, 
  onReaction, 
  onToggleComments,
  onCommentsClick,
  commentsExpanded = false
}: PostActionsProps) {
  const reactionsByType = post.reactions?.by_type || {};
  const userReaction = post.user_reaction as ReactionType | undefined;
  const totalReactions = Object.values(reactionsByType).reduce((sum, count) => sum + count, 0);
  const commentCount = post.comments_count || 0;

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
          <CommentsCount 
            count={commentCount} 
            onClick={onCommentsClick} 
            isExpanded={commentsExpanded}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 border-t border-b py-1 post-actions">
        <LongPressReactionButton 
          userReaction={userReaction} 
          onReactionClick={handleReaction}
          postId={post.id}
        />

        <CommentButton onToggleComments={onToggleComments} />

        <ShareOptions post={post}>
          <Button variant="ghost" size="sm" className="flex-1 post-action-button">
            <Share className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </ShareOptions>
      </div>
    </div>
  );
}
