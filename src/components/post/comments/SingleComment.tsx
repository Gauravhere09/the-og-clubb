
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Comment } from "@/types/post";
import type { ReactionType } from "@/types/database/social.types";
import { useCommentMutations } from "@/hooks/use-comment-mutations";
import { supabase } from "@/integrations/supabase/client";
import { CommentHeader } from "./CommentHeader";
import { CommentActions } from "./CommentActions";
import { CommentContent } from "./CommentContent";
import { CommentFooter } from "./CommentFooter";

interface SingleCommentProps {
  comment: Comment;
  onReaction: (commentId: string, type: ReactionType) => void;
  onReply: (id: string, username: string) => void;
  onDeleteComment: (commentId: string) => void;
  isReply?: boolean;
}

export function SingleComment({ 
  comment, 
  onReaction, 
  onReply, 
  onDeleteComment,
  isReply = false 
}: SingleCommentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { editComment } = useCommentMutations(comment.post_id);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const commentTextRef = useRef<HTMLDivElement>(null);

  // Check if the current user is the author of this comment
  useEffect(() => {
    const checkAuthor = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        const isCurrentUserAuthor = data.user && data.user.id === comment.user_id;
        setIsAuthor(!!isCurrentUserAuthor);
      } catch (error) {
        console.error('Error checking comment author:', error);
        setIsAuthor(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthor();
  }, [comment.user_id]);

  const isAudioComment = comment.content.startsWith('[Audio]');
  const audioUrl = isAudioComment ? comment.content.replace('[Audio] ', '') : null;

  const handleDeleteComment = () => {
    onDeleteComment(comment.id);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() === '') return;
    
    editComment({ 
      commentId: comment.id, 
      content: editedContent 
    }, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  const handleReply = () => {
    onReply(comment.id, comment.profiles?.username || '');
  };

  // Long press handling for copy
  const handleLongPressStart = () => {
    if (isAudioComment) return; // Don't allow copying audio comments
    
    // Start a timer for long press
    longPressTimer.current = window.setTimeout(() => {
      setIsCopying(true);
      copyCommentText();
    }, 800); // 800ms for long press
  };

  const handleLongPressEnd = () => {
    // Clear the timer if touch ends
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsCopying(false);
  };

  const copyCommentText = () => {
    if (isAudioComment) return; // Don't copy audio comments
    
    // Create a temporary indicator
    const indicator = document.createElement('div');
    indicator.className = 'copying-indicator active';
    indicator.textContent = 'Comentario copiado';
    document.body.appendChild(indicator);
    
    // Copy to clipboard
    try {
      navigator.clipboard.writeText(comment.content).then(() => {
        console.log('Copied to clipboard');
        
        // Remove the indicator after a delay
        setTimeout(() => {
          indicator.classList.remove('active');
          setTimeout(() => {
            document.body.removeChild(indicator);
          }, 200);
        }, 1500);
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`${isReply ? "ml-12" : ""} space-y-1`}>
      <div className="flex items-start gap-2">
        <CommentHeader 
          userId={comment.user_id}
          username={comment.profiles?.username}
          avatarUrl={comment.profiles?.avatar_url}
        />
        <div className="flex-1 max-w-[70%]">
          <div 
            className="bg-muted p-1.5 rounded-lg"
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
            onTouchCancel={handleLongPressEnd}
            onMouseDown={handleLongPressStart}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
          >
            <div className="flex justify-between items-start">
              <Link 
                to={`/profile/${comment.user_id}`}
                className="font-medium text-xs hover:underline hover:text-primary transition-colors"
              >
                {comment.profiles?.username}
              </Link>
              {!isLoading && isAuthor && (
                <CommentActions
                  onEdit={() => setIsEditing(true)}
                  onDelete={handleDeleteComment}
                />
              )}
            </div>
            <div 
              ref={commentTextRef} 
              className={`${isCopying ? 'pulse-on-hold' : ''} ${!isAudioComment ? 'comment-text-selectable' : ''}`}
            >
              <CommentContent
                content={comment.content}
                isAudio={isAudioComment}
                audioUrl={audioUrl}
                isEditing={isEditing}
                editedContent={editedContent}
                onEditChange={setEditedContent}
                onSaveEdit={handleSaveEdit}
              />
            </div>
          </div>
          <CommentFooter
            commentId={comment.id}
            userReaction={comment.user_reaction as ReactionType | null}
            reactionsCount={comment.likes_count || 0}
            onReaction={onReaction}
            onReply={handleReply}
          />
        </div>
      </div>
      
      {/* Mostrar respuestas si existen */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-8 mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <SingleComment
              key={reply.id}
              comment={reply}
              onReaction={onReaction}
              onReply={onReply}
              onDeleteComment={onDeleteComment}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
