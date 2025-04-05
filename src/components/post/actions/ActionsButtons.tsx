
import React from "react";
import { Button } from "@/components/ui/button";
import { ShareOptions } from "./ShareOptions";
import { CommentButton } from "./CommentButton";
import { LongPressReactionButton } from "../reactions/LongPressReactionButton";
import { Share, Briefcase, Users } from "lucide-react";
import { Post } from "@/types/post";
import { ReactionType } from "../reactions/ReactionIcons";

interface ActionsButtonsProps {
  userReaction: ReactionType | undefined;
  handleReaction: (type: ReactionType) => void;
  postId: string;
  onToggleComments: () => void;
  commentsExpanded: boolean;
  post: Post;
  showJoinButton: boolean;
  onJoinClick: () => void;
}

export function ActionsButtons({
  userReaction,
  handleReaction,
  postId,
  onToggleComments,
  commentsExpanded,
  post,
  showJoinButton,
  onJoinClick
}: ActionsButtonsProps) {
  // Check if current user is joined to the idea
  const isJoined = post.idea?.participants.some(p => {
    // This is a simplification, in a real scenario you'd check against the current user ID
    return p.user_id === (window as any).currentUserId;
  });

  return (
    <div className="flex gap-2 border-t border-b py-1 post-actions">
      <LongPressReactionButton 
        userReaction={userReaction} 
        onReactionClick={handleReaction}
        postId={postId}
        className="flex-1"
      />

      <CommentButton 
        onToggleComments={onToggleComments} 
        isExpanded={commentsExpanded}
        className="flex-1"
      />

      <ShareOptions post={post}>
        <Button variant="ghost" size="sm" className="flex-1 post-action-button">
          <Share className="h-4 w-4 mr-2" />
          Compartir
        </Button>
      </ShareOptions>

      {/* Botón de unirse a la idea */}
      {showJoinButton ? (
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 post-action-button text-primary" 
          onClick={onJoinClick}
        >
          <Briefcase className="h-4 w-4 mr-2" />
          Unirme
        </Button>
      ) : post.idea && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 post-action-button text-primary opacity-50 cursor-default"
          disabled
        >
          <Users className="h-4 w-4 mr-2" />
          Unido
        </Button>
      )}
    </div>
  );
}
