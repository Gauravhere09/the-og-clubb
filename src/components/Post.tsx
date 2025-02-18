import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share, Play, MoreVertical, Globe, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Post as PostType, Comment } from "@/types/post";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createComment, getComments, toggleLike, deletePost, updatePostVisibility } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSession } from "@supabase/auth-helpers-react";

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

  const { mutate: handleLike } = useMutation({
    mutationFn: () => toggleLike(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: handleDelete } = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Publicación eliminada",
        description: "La publicación se ha eliminado correctamente",
      });
    },
  });

  const { mutate: handleVisibilityChange } = useMutation({
    mutationFn: (visibility: 'public' | 'friends' | 'private') => 
      updatePostVisibility(post.id, visibility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Visibilidad actualizada",
        description: "La visibilidad de la publicación se ha actualizado correctamente",
      });
    },
  });

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4" />;
      case 'friends':
        return <Users className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? "ml-12" : ""} space-y-2`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.profiles?.avatar_url} />
          <AvatarFallback>{comment.profiles?.username?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted p-3 rounded-lg">
            <p className="font-medium text-sm">{comment.profiles?.username}</p>
            <p className="text-sm">{comment.content}</p>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => setReplyTo({ id: comment.id, username: comment.profiles?.username || "" })}
            >
              Responder
            </Button>
            <span className="text-xs text-muted-foreground">
              {format(new Date(comment.created_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
            </span>
          </div>
        </div>
      </div>
      {comment.replies?.map((reply) => renderComment(reply, true))}
    </div>
  );

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Avatar>
          <AvatarImage src={post.profiles?.avatar_url} />
          <AvatarFallback>{post.profiles?.username?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-medium">{post.profiles?.username}</h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(post.created_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
          </p>
        </div>
        {session?.user?.id === post.user_id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleVisibilityChange('public')}>
                <Globe className="h-4 w-4 mr-2" />
                Público
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleVisibilityChange('friends')}>
                <Users className="h-4 w-4 mr-2" />
                Amigos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleVisibilityChange('private')}>
                <Lock className="h-4 w-4 mr-2" />
                Privado
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDelete()}
              >
                Eliminar publicación
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {post.content && (
        <div className="mb-4">
          <p>{post.content}</p>
          <div className="flex items-center gap-2 mt-1">
            {getVisibilityIcon(post.visibility)}
            <span className="text-xs text-muted-foreground capitalize">
              {post.visibility}
            </span>
          </div>
        </div>
      )}

      {post.media_url && (
        <div className="mb-4">
          {post.media_type === 'image' && (
            <img
              src={post.media_url}
              alt="Post media"
              className="w-full rounded-lg"
            />
          )}
          {post.media_type === 'video' && (
            <video
              src={post.media_url}
              controls
              className="w-full rounded-lg"
            />
          )}
          {post.media_type === 'audio' && (
            <div className="bg-secondary rounded-lg p-3 flex items-center gap-3">
              <Button variant="secondary" size="icon">
                <Play className="h-4 w-4" />
              </Button>
              <audio src={post.media_url} controls className="w-full" />
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleLike()}
          className={post.user_has_liked ? "text-red-500" : ""}
        >
          <Heart className="h-4 w-4 mr-2" />
          {post.likes_count || 0}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {post.comments_count || 0}
        </Button>
        <Button variant="ghost" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Compartir
        </Button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4">
          <div className="space-y-4">
            {comments.map((comment) => renderComment(comment))}
          </div>

          <div className="space-y-2">
            {replyTo && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Respondiendo a @{replyTo.username}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setReplyTo(null)}
                >
                  Cancelar
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="resize-none"
              />
              <Button onClick={() => submitComment()}>
                Comentar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
