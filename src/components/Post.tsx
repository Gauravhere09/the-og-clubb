
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
import { useCommentMutations } from "@/hooks/use-comment-mutations";

interface PostProps {
  post: PostType;
}

export function Post({ post }: PostProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { handleReaction, handleDeletePost, toggleCommentReaction, submitComment, submitVote } = usePostMutations(post.id);
  const { deleteComment } = useCommentMutations(post.id);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);

  // Get current user and check if they're the author
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData.user) {
          setCurrentUser(userData.user);
          const authorCheck = userData.user.id === post.user_id;
          setIsAuthor(authorCheck);
          
          console.log('Current user ID:', userData.user.id);
          console.log('Post user ID:', post.user_id);
          console.log('Is user the author?', authorCheck);
        } else {
          console.log('No user logged in');
          setIsAuthor(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthor(false);
      }
    };

    checkAuthStatus();
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
    deleteComment(commentId);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleCommentsClick = () => {
    setShowComments(true);
  };
  
  const onDeletePost = () => {
    console.log('Delete post requested. Is author?', isAuthor);
    if (isAuthor) {
      handleDeletePost();
    }
  };

  const handleVoteOnPoll = async (optionId: string) => {
    return submitVote(optionId);
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <PostHeader 
          post={post} 
          onDelete={onDeletePost} 
          isAuthor={isAuthor} 
        />
        <PostContent post={post} postId={post.id} onVote={handleVoteOnPoll} />
        <PostActions
          post={post}
          onReaction={handleReaction}
          onToggleComments={handleToggleComments}
          onCommentsClick={handleCommentsClick}
        />
      </div>
      {showComments && (
        <div className="px-4 pb-4">
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
        </div>
      )}
    </Card>
  );
}
