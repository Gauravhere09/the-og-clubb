
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
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface PostProps {
  post: PostType;
}

export function Post({ post }: PostProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { handleReaction, handleDeletePost, toggleCommentReaction, submitComment } = usePostMutations(post.id);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      console.log('Current user:', user?.id);
      console.log('Post user:', post.user_id);
      console.log('Are they the same?', user?.id === post.user_id);
    };

    getUser();
  }, [post.user_id]);

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => getComments(post.id),
    enabled: showComments,
  });

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentReaction = (commentId: string, type: ReactionType) => {
    toggleCommentReaction({ commentId, type });
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      submitComment(
        { 
          content: newComment, 
          replyToId: replyTo?.id 
        },
        {
          onSuccess: () => {
            setNewComment("");
            setReplyTo(null);
          }
        }
      );
    }
  };

  const handleReply = (id: string, username: string) => {
    setReplyTo({ id, username });
  };

  const handleDeleteComment = (commentId: string) => {
    // Handle delete comment
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleCommentsClick = () => {
    setShowComments(true);
  };
  
  // Verificamos si el usuario actual es el autor del post
  const isAuthor = currentUser?.id === post.user_id;

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <PostHeader 
          post={post} 
          onDelete={handleDeletePost} 
          isAuthor={isAuthor} 
        />
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
          comments={comments}
          onReaction={handleCommentReaction}
          onReply={handleReply}
          onSubmitComment={handleSubmitComment}
          onDeleteComment={handleDeleteComment}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
        />
      )}
    </Card>
  );
}
