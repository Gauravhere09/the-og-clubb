
import { SingleComment } from "./comments/SingleComment";
import { CommentInput } from "./comments/CommentInput";
import type { Comment } from "@/types/post";
import type { ReactionType } from "@/types/database/social.types";

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
  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <SingleComment
              key={comment.id}
              comment={comment}
              onReaction={onReaction}
              onReply={onReply}
              onDeleteComment={onDeleteComment}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center">No hay comentarios. ¡Sé el primero en comentar!</p>
        )}
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
