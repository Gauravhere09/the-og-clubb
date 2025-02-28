
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { usePostMutations, type ReactionType } from "@/hooks/use-post-mutations";
import { Comments } from "@/components/post/Comments";
import { PostActions } from "@/components/post/PostActions";
import { PostContent } from "@/components/post/PostContent";
import { PostHeader } from "@/components/post/PostHeader";
import { type Post as PostType } from "@/types/post";
import { SharedPostContent } from "./post/SharedPostContent";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PostProps {
  post: PostType;
  hideComments?: boolean;
}

export function Post({ post, hideComments = false }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Initialize usePostMutations with the post ID
  const { 
    handleReaction, 
    handleDeletePost,
    toggleCommentReaction,
    submitComment
  } = usePostMutations(post.id);

  // Fetch current user ID on component mount
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    getUserId();
  }, []);

  const onDeletePost = () => {
    handleDeletePost();
  };

  const onReaction = (type: ReactionType) => {
    handleReaction(type);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentsClick = () => {
    setShowComments(true);
  };

  const handleCommentReaction = (commentId: string, type: ReactionType) => {
    toggleCommentReaction({ commentId, type });
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyTo({ id: commentId, username });
    setShowComments(true);
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    submitComment({
      content: newComment,
      replyToId: replyTo?.id
    });
    
    setNewComment("");
    setReplyTo(null);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      
      // Update local state to remove the deleted comment
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado correctamente",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el comentario",
      });
    }
  };

  // Check if current user is the author of the post
  const isCurrentUserAuthor = post.user_id === currentUserId;

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="p-4 space-y-4">
        <PostHeader 
          post={post} 
          onDelete={onDeletePost}
          isAuthor={isCurrentUserAuthor}
        />
        
        <PostContent 
          post={post} 
          postId={post.id}
        />
        
        {post.shared_post && (
          <div className="mt-2">
            <SharedPostContent post={post.shared_post} />
          </div>
        )}
        
        <PostActions 
          post={post} 
          onReaction={onReaction} 
          onToggleComments={toggleComments}
          onCommentsClick={handleCommentsClick}
        />
        
        {!hideComments && showComments && (
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
      </div>
    </Card>
  );
}
