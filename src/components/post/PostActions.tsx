
import React from "react";
import { Post } from "@/types/post";
import { PostActionsContainer } from "./actions/PostActionsContainer";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReactionType } from "@/components/post/reactions/ReactionIcons";

interface PostActionsProps {
  post: Post;
  onReaction: (type: ReactionType) => void;
  onToggleComments: () => void;
  onCommentsClick?: () => void;
  commentsExpanded?: boolean;
}

export function PostActions({ 
  post, 
  onReaction, 
  onToggleComments, 
  onCommentsClick,
  commentsExpanded = false
}: PostActionsProps) {
  const isMobile = useIsMobile();
  
  // Verificar si es un post de idea
  const isIdeaPost = post.idea !== null && post.idea !== undefined;
  
  return (
    <div className="py-2">
      <PostActionsContainer 
        post={post}
        onReaction={onReaction}
        onToggleComments={onToggleComments}
        onCommentsClick={onCommentsClick || onToggleComments}
        commentsExpanded={commentsExpanded}
        isIdeaPost={isIdeaPost}
      />
    </div>
  );
}
