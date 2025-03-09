
import { useState, useEffect } from "react";
import { usePostMutations, type ReactionType } from "@/hooks/use-post-mutations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getComments } from "@/lib/api/comments";
import { type Post } from "@/types/post";

export function usePost(post: Post, hideComments = false) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
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

  // Fetch comments when showComments changes to true
  useEffect(() => {
    if (showComments) {
      const fetchComments = async () => {
        try {
          const commentsData = await getComments(post.id);
          setComments(commentsData);
        } catch (error) {
          console.error('Error fetching comments:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudieron cargar los comentarios",
          });
        }
      };
      fetchComments();
    }
  }, [showComments, post.id, toast]);

  const onDeletePost = () => {
    handleDeletePost();
  };

  const onReaction = (type: ReactionType) => {
    handleReaction(type);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
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
    }, {
      onSuccess: () => {
        // Recargar comentarios después de publicar un nuevo comentario
        getComments(post.id).then(updatedComments => {
          setComments(updatedComments);
        });
      }
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
      
      // Recargar los comentarios después de eliminar
      const updatedComments = await getComments(post.id);
      setComments(updatedComments);
      
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

  return {
    showComments,
    comments,
    newComment,
    replyTo,
    currentUserId,
    isCurrentUserAuthor: post.user_id === currentUserId,
    onDeletePost,
    onReaction,
    toggleComments,
    handleCommentReaction,
    handleReply,
    handleSubmitComment,
    handleCancelReply,
    handleDeleteComment,
    setNewComment
  };
}
