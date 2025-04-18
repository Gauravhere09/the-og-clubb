
import React, { useEffect } from "react";
import { Post } from "@/types/post";
import { ReactionType } from "@/components/post/reactions/ReactionIcons";
import { ActionsSummary } from "./ActionsSummary";
import { ActionsButtons } from "./ActionsButtons";
import { JoinIdeaDialogWrapper } from "./JoinIdeaDialogWrapper";
import { useJoinIdeaDialog } from "./hooks/use-join-idea-dialog";

interface PostActionsProps {
  post: Post;
  onReaction: (type: ReactionType) => void;
  onToggleComments: () => void;
  onCommentsClick: () => void;
  commentsExpanded?: boolean;
  isIdeaPost?: boolean;
}

export function PostActionsContainer({ 
  post, 
  onReaction, 
  onToggleComments,
  onCommentsClick,
  commentsExpanded = false,
  isIdeaPost = false
}: PostActionsProps) {
  const reactionsByType = post.reactions?.by_type || {};
  const userReaction = post.user_reaction as ReactionType | undefined;
  const totalReactions = Object.values(reactionsByType).reduce((sum, count) => sum + count, 0);
  const commentCount = post.comments_count || 0;
  
  // Use custom hook for join idea functionality
  const {
    isJoinDialogOpen,
    setIsJoinDialogOpen,
    profession,
    setProfession,
    isCurrentUserJoined,
    handleJoinIdea,
    showJoinButton
  } = useJoinIdeaDialog(post);

  // Log state for debugging
  useEffect(() => {
    if (post.idea) {
      console.log("PostActionsContainer for idea post:", post.id, {
        isJoinDialogOpen,
        isCurrentUserJoined,
        showJoinButton,
        idea: post.idea
      });
    }
  }, [post.id, post.idea, isJoinDialogOpen, isCurrentUserJoined, showJoinButton]);

  // Manejador local para evitar duplicación de actualizaciones de UI
  const handleReaction = (type: ReactionType) => {
    onReaction(type);
  };

  return (
    <div className="space-y-0">
      {/* Action Buttons - Simplified layout similar to image */}
      <ActionsButtons 
        userReaction={userReaction}
        handleReaction={handleReaction}
        postId={post.id}
        onToggleComments={onToggleComments}
        commentsExpanded={commentsExpanded}
        post={post}
        showJoinButton={showJoinButton}
        onJoinClick={() => setIsJoinDialogOpen(true)}
      />
      
      {/* Interactions Summary - Only show if there are interactions */}
      {(totalReactions > 0 || commentCount > 0) && (
        <ActionsSummary 
          totalReactions={totalReactions} 
          reactionsByType={reactionsByType} 
          post={post} 
          commentCount={commentCount}
          onCommentsClick={onCommentsClick}
          commentsExpanded={commentsExpanded}
        />
      )}
      
      {/* Join Idea Dialog */}
      <JoinIdeaDialogWrapper
        isOpen={isJoinDialogOpen}
        onOpenChange={setIsJoinDialogOpen}
        profession={profession}
        setProfession={setProfession}
        onJoin={handleJoinIdea}
        ideaTitle={post.idea?.title}
      />
    </div>
  );
}
