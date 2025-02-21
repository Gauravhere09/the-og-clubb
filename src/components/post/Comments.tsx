
import type { Comment } from "@/types/post";
import { SingleComment } from "./comments/SingleComment";
import { CommentInput } from "./comments/CommentInput";

interface CommentsProps {
  comments: Comment[];
  onReaction: (commentId: string, type: 'like' | 'love' | 'haha' | 'sad' | 'angry') => void;
  onReply: (id: string, username: string) => void;
  onSubmitComment: () => void;
  onAudioRecording: (blob: Blob) => void;
  onDeleteComment: (commentId: string) => void;
  newComment: string;
  onNewCommentChange: (value: string) => void;
  replyTo: { id: string; username: string } | null;
  onCancelReply: () => void;
}

export function Comments({
  comments,
  onReaction,
  onReply,
  onSubmitComment,
  onAudioRecording,
  onDeleteComment,
  newComment,
  onNewCommentChange,
  replyTo,
  onCancelReply
}: CommentsProps) {
  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-4">
        {comments.map((comment) => (
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
        onAudioRecording={onAudioRecording}
        replyTo={replyTo}
        onCancelReply={onCancelReply}
      />
    </div>
  );
}
