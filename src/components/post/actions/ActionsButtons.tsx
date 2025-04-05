
import React from "react";
import { Button } from "@/components/ui/button";
import { ShareOptions } from "./ShareOptions";
import { CommentButton } from "./CommentButton";
import { LongPressReactionButton } from "../reactions/LongPressReactionButton";
import { Share, Briefcase, Users, Lightbulb } from "lucide-react";
import { Post } from "@/types/post";
import { ReactionType } from "../reactions/ReactionIcons";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  // Check if this is an idea post
  const isIdeaPost = !!post.idea;

  // Check if current user is joined to the idea
  const isJoined = post.idea?.participants && post.idea.participants.some(p => {
    // This is a simplification, in a real scenario you'd check against the current user ID
    return p.user_id === (window as any).currentUserId;
  });

  // Log for debugging
  React.useEffect(() => {
    if (isIdeaPost) {
      console.log("Idea post in ActionsButtons:", post.id, showJoinButton, isJoined);
    }
  }, [isIdeaPost, post.id, showJoinButton, isJoined]);

  const handleJoinClick = () => {
    onJoinClick();
    
    toast({
      title: "Unirse a la idea",
      description: "Por favor complete su información profesional para unirse a esta idea.",
    });
  };

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

      {/* Solo mostrar el botón de unirse si es un post de idea */}
      {isIdeaPost && (
        showJoinButton ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 post-action-button text-blue-600 dark:text-blue-400" 
            onClick={handleJoinClick}
          >
            <Users className="h-4 w-4 mr-2" />
            Unirme
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 post-action-button text-blue-600 dark:text-blue-400"
            disabled
          >
            <Users className="h-4 w-4 mr-2" />
            Unido
          </Button>
        )
      )}
    </div>
  );
}
