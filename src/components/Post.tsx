
import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { Post as PostType } from "@/types/post";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createComment, getComments, deletePost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { toggleReaction } from "@/lib/api/likes";
import { supabase } from "@/integrations/supabase/client";
import { PostHeader } from "./post/PostHeader";
import { PostContent } from "./post/PostContent";
import { PostActions } from "./post/PostActions";
import { Comments } from "./post/Comments";
import type { Tables } from "@/types/database.types";

type ReactionType = Tables["likes"]["Row"]["reaction_type"];

interface PostProps {
  post: PostType;
}

export function Post({ post }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const session = useSession();

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => getComments(post.id),
    enabled: showComments,
  });

  const { mutate: submitComment } = useMutation({
    mutationFn: async () => {
      if (!newComment.trim()) throw new Error("El comentario no puede estar vacío");
      return createComment(post.id, newComment, replyTo?.id);
    },
    onSuccess: () => {
      setNewComment("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
      toast({
        title: "Comentario añadido",
        description: "Tu comentario se ha publicado correctamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al publicar el comentario",
      });
    },
  });

  const { mutate: handleReaction } = useMutation({
    mutationFn: (type: ReactionType) => 
      toggleReaction(post.id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: handleDeletePost } = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Post eliminado",
        description: "El post se ha eliminado correctamente",
      });
    }
  });

  const { mutate: toggleCommentReaction } = useMutation({
    mutationFn: async ({ commentId, type }: { commentId: string; type: ReactionType }) => {
      if (!session?.user?.id) {
        throw new Error("Debes iniciar sesión para reaccionar");
      }
      
      const { data: existingReaction } = await supabase
        .from('likes')
        .select('id, user_id, post_id, comment_id, reaction_type, created_at')
        .eq('user_id', session.user.id)
        .eq('comment_id', commentId)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === type) {
          const { error } = await supabase
            .from('likes')
            .delete()
            .eq('id', existingReaction.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('likes')
            .update({ reaction_type: type })
            .eq('id', existingReaction.id);
          if (error) throw error;
        }
      } else {
        const newLike: Tables['likes']['Insert'] = {
          user_id: session.user.id,
          comment_id: commentId,
          post_id: null,
          reaction_type: type
        };
        
        const { error } = await supabase
          .from('likes')
          .insert(newLike);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
      toast({
        title: "Reacción actualizada",
        description: "Tu reacción se ha actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar la reacción",
      });
    },
  });

  const { mutate: deleteComment } = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
      toast({
        title: "Comentario eliminado",
        description: "El comentario se ha eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el comentario",
      });
    },
  });

  const handleAudioRecording = async (blob: Blob) => {
    try {
      const fileName = `${crypto.randomUUID()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('audio-messages')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('audio-messages')
        .getPublicUrl(fileName);

      await createComment(post.id, `[Audio] ${publicUrl}`, replyTo?.id);
      
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
      toast({
        title: "Audio enviado",
        description: "Tu mensaje de audio se ha publicado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje de audio",
      });
    }
  };

  return (
    <Card className="p-4">
      <PostHeader post={post} onDelete={() => handleDeletePost()} />
      <PostContent post={post} />
      <PostActions 
        post={post}
        onReaction={handleReaction}
        onToggleComments={() => setShowComments(!showComments)}
      />
      {showComments && (
        <Comments
          comments={comments}
          onReaction={(commentId, type) => toggleCommentReaction({ commentId, type })}
          onReply={(id, username) => setReplyTo({ id, username })}
          onSubmitComment={() => submitComment()}
          onAudioRecording={handleAudioRecording}
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
