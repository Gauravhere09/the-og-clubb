
import { CommentsList } from "./comments/CommentsList";
import { CommentInput } from "./comments/CommentInput";
import type { Comment } from "@/types/post";
import type { ReactionType } from "@/types/database/social.types";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

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
  showComments: boolean;
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
  onCancelReply,
  showComments
}: CommentsProps) {
  // Solo renderizamos los comentarios si showComments es true
  if (!showComments) return null;

  return (
    <div className="mt-4 space-y-4">
      <CommentsList 
        comments={comments}
        onReaction={onReaction}
        onReply={onReply}
        onDeleteComment={onDeleteComment}
      />

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
