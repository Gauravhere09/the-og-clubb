
import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { Post as PostType } from "@/types/post";
import { useQuery } from "@tanstack/react-query";
import { getComments } from "@/lib/api";
import { PostHeader } from "./post/PostHeader";
import { PostContent } from "./post/PostContent";
import { PostActions } from "./post/PostActions";
import { Comments } from "./post/Comments";
import { usePostMutations } from "@/hooks/use-post-mutations";
import { useCommentMutations } from "@/hooks/use-comment-mutations";

interface PostProps {
  post: PostType;
}

export function Post({ post }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => getComments(post.id),
    enabled: showComments,
  });

  const { handleReaction, handleDeletePost, toggleCommentReaction } = usePostMutations(post.id);
  const { submitComment, deleteComment } = useCommentMutations(post.id);

  const handleSubmitComment = () => {
    submitComment({ 
      content: newComment,
      replyToId: replyTo?.id
    });
    setNewComment("");
    setReplyTo(null);
  };

  return (
    <Card className="p-4">
      <PostHeader post={post} onDelete={() => handleDeletePost()} />
      <PostContent post={post} />
      <PostActions 
        post={post}
        onReaction={(type) => handleReaction(type)}
        onToggleComments={() => setShowComments(!showComments)}
      />
      {showComments && (
        <Comments
          comments={comments}
          onReaction={(commentId, type) => toggleCommentReaction({ commentId, type })}
          onReply={(id, username) => setReplyTo({ id, username })}
          onSubmitComment={handleSubmitComment}
          onDeleteComment={(commentId) => deleteComment(commentId)}
          newComment={newComment}
          onNewCommentChange={(value) => setNewComment(value)}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      )}
    </Card>
  );
}
