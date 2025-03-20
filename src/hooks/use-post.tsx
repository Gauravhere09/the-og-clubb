import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useCommentMutations } from "./use-comment-mutations";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchComments } from "@/lib/api/posts/queries";
import { Post, Comment } from "@/types/post";
import { sendMentionNotifications } from "@/lib/api/posts/notifications";
import { ReactionType } from "@/types/database/social.types";

export function usePost(post: Post, hideComments = false) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [isCurrentUserAuthor, setIsCurrentUserAuthor] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { submitComment, deleteComment } = useCommentMutations(post.id);
  
  useEffect(() => {
    const checkAuthor = async () => {
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        setIsCurrentUserAuthor(data.user.id === post.user_id);
      }
    };
    
    checkAuthor();
  }, [post.user_id]);
  
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => fetchComments(post.id),
    enabled: showComments
  });
  
  const { mutate: reactToPost } = useMutation({
    mutationFn: async ({ postId, type }: { postId: string; type: ReactionType }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para reaccionar");
      
      const { data: existingReaction } = await supabase
        .from("reactions")
        .select("id, reaction_type")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (existingReaction) {
        if (existingReaction.reaction_type === type) {
          await supabase
            .from("reactions")
            .delete()
            .eq("id", existingReaction.id);
        } else {
          await supabase
            .from("reactions")
            .update({ reaction_type: type })
            .eq("id", existingReaction.id);
        }
      } else {
        await supabase
          .from("reactions")
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: type
          });
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar la reacción",
      });
    }
  });
  
  const onReaction = (postId: string, type: ReactionType) => {
    reactToPost({ postId, type });
  };
  
  const toggleComments = () => {
    setShowComments(prev => !prev);
  };
  
  const onDeletePost = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Publicación eliminada",
        description: "La publicación se ha eliminado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la publicación",
      });
    }
  };
  
  const handleSubmitComment = async () => {
    if (!newComment.trim() && !commentImage) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El comentario no puede estar vacío",
      });
      return;
    }
    
    try {
      let mediaUrl = null;
      
      if (commentImage) {
        const fileName = `${Date.now()}_${commentImage.name.replace(/\s+/g, '_')}`;
        const { data: uploadResult, error: uploadError } = await supabase.storage
          .from('comment-images')
          .upload(fileName, commentImage);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('comment-images')
          .getPublicUrl(fileName);
        
        mediaUrl = publicUrl;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para comentar");
      
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment,
          parent_id: replyTo?.id || null,
          media_url: mediaUrl
        })
        .select()
        .single();
      
      if (commentError) throw commentError;
      
      if (newComment.includes('@')) {
        await sendMentionNotifications(
          newComment, 
          post.id, 
          commentData.id, 
          user.id
        );
      }
      
      setNewComment("");
      setCommentImage(null);
      setReplyTo(null);
      
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
      
      toast({
        title: "Comentario publicado",
        description: "Tu comentario se ha publicado correctamente",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo publicar el comentario",
      });
    }
  };
  
  const handleCommentReaction = (commentId: string, type: ReactionType) => {
  };
  
  const handleReply = (id: string, username: string) => {
    setReplyTo({ id, username });
    setNewComment(`@${username} `);
  };
  
  const handleCancelReply = () => {
    setReplyTo(null);
    setNewComment("");
  };
  
  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
  };
  
  return {
    showComments,
    comments,
    newComment,
    commentImage,
    setCommentImage,
    replyTo,
    isCurrentUserAuthor,
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
