
import { useState, useEffect } from "react";
import type { Comment } from "@/types/post";
import { SingleComment } from "./comments/SingleComment";
import { CommentInput } from "./comments/CommentInput";
import type { ReactionType } from "@/types/database/social.types";
import { supabase } from "@/integrations/supabase/client";

interface CommentsProps {
  postId: string;
  comments: Comment[];
  onReaction: (commentId: string, type: ReactionType) => void;
  onReply: (id: string, username: string) => void;
  onSubmitComment: () => void;
  onDeleteComment: (commentId: string) => void;
  newComment: string;
  onNewCommentChange: (value: string) => void;
  replyTo: { id: string; username: string } | null;
  onCancelReply: () => void;
}

export function Comments({
  postId,
  comments,
  onReaction,
  onReply,
  onSubmitComment,
  onDeleteComment,
  newComment,
  onNewCommentChange,
  replyTo,
  onCancelReply
}: CommentsProps) {
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            profiles:user_id(username, avatar_url)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setLocalComments(data as Comment[]);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [postId]);

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-4">
        {localComments.map((comment) => (
          <SingleComment
            key={comment.id}
            comment={comment}
            onReaction={onReaction}
            onReply={onReply}
            onDeleteComment={onDeleteComment}
          />
        ))}
      </div>

      <CommentInput
        newComment={newComment}
        onNewCommentChange={onNewCommentChange}
        onSubmitComment={onSubmitComment}
        replyTo={replyTo}
        onCancelReply={onCancelReply}
      />
    </div>
  );
}
