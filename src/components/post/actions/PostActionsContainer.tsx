
import React from "react";
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
}

export function PostActionsContainer({ 
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

  // Manejador local para evitar duplicación de actualizaciones de UI
  const handleReaction = (type: ReactionType) => {
    onReaction(type);
  };

  return (
    <div className="space-y-2">
      {/* Interactions Summary */}
      <ActionsSummary 
        totalReactions={totalReactions} 
        reactionsByType={reactionsByType} 
        post={post} 
        commentCount={commentCount}
        onCommentsClick={onCommentsClick}
        commentsExpanded={commentsExpanded}
      />
      
      {/* Action Buttons */}
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
