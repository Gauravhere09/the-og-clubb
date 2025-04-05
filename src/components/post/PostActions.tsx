
import React from "react";
import type { Post } from "@/types/post";
import { type ReactionType } from "./reactions/ReactionIcons";
import { PostActionsContainer } from "./actions/PostActionsContainer";

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
  return (
    <PostActionsContainer
      post={post}
      onReaction={onReaction}
      onToggleComments={onToggleComments}
      onCommentsClick={onCommentsClick}
      commentsExpanded={commentsExpanded}
    />
  );
}
