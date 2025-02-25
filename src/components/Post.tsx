
import { Card } from "@/components/ui/card";
import type { Post as PostType } from "@/types/post";
import { PostHeader } from "./post/PostHeader";
import { PostContent } from "./post/PostContent";
import { PostActions } from "./post/PostActions";
import { Comments } from "./post/Comments";
import { usePostMutations } from "@/hooks/use-post-mutations";
import { type ReactionType } from "@/types/database/social.types";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getComments } from "@/lib/api/comments";

interface PostProps {
  post: PostType;
}

export function Post({ post }: PostProps) {
  const { handleReaction, handleDeletePost, toggleCommentReaction } = usePostMutations(post.id);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => getComments(post.id),
    enabled: showComments, // Only fetch when comments are visible
  });

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentReaction = (commentId: string, type: ReactionType) => {
    toggleCommentReaction({ commentId, type });
  };

  const handleSubmitComment = () => {
    // Handle submit comment
  };

  const handleReply = (id: string, username: string) => {
    // Handle reply
  };

  const handleDeleteComment = (commentId: string) => {
    // Handle delete comment
  };

  const handleCancelReply = () => {
    // Handle cancel reply
  };

  const handleCommentsClick = () => {
    setShowComments(true);
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <PostHeader post={post} onDelete={handleDeletePost} />
        <PostContent post={post} postId={post.id} />
        <PostActions
          post={post}
          onReaction={handleReaction}
          onToggleComments={handleToggleComments}
          onCommentsClick={handleCommentsClick}
        />
      </div>
      {showComments && (
        <Comments
          postId={post.id}
          onReaction={handleCommentReaction}
          onReply={handleReply}
          onSubmitComment={handleSubmitComment}
          onDeleteComment={handleDeleteComment}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          replyTo={null}
          onCancelReply={handleCancelReply}
          comments={comments}
        />
      )}
    </Card>
  );
}
