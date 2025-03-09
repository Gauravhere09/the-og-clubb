import { useState, useEffect } from "react";
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

  return (
    <div className={`${isReply ? "ml-12" : ""} space-y-1`}>
      <div className="flex items-start gap-2">
        <CommentHeader 
          userId={comment.user_id}
          username={comment.profiles?.username}
          avatarUrl={comment.profiles?.avatar_url}
        />
        <div className="flex-1 max-w-[70%]">
          <div className="bg-muted p-1.5 rounded-lg">
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
