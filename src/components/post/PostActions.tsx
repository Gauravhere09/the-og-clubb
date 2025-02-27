
import { Button } from "@/components/ui/button";
import { MessagesSquare, Link2, Share } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";
import type { Post } from "@/types/post";
import { ReactionSummary } from "./reactions/ReactionSummary";
import { ReactionDetails } from "./reactions/ReactionDetails";
import { ReactionButton } from "./reactions/ReactionButton";
import { type ReactionType } from "./reactions/ReactionIcons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface PostActionsProps {
  post: Post;
  onReaction: (type: ReactionType) => void;
  onToggleComments: () => void;
  onCommentsClick: () => void;
}

export function PostActions({ 
  post, 
  onReaction, 
  onToggleComments,
  onCommentsClick 
}: PostActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const reactionsByType = post.reactions?.by_type || {};
  const userReaction = post.user_reaction as ReactionType | undefined;
  const totalReactions = Object.values(reactionsByType).reduce((sum, count) => sum + count, 0);
  const commentCount = post.comments_count || 0;
  const [showShareOptions, setShowShareOptions] = React.useState(false);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles",
    });
    setShowShareOptions(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Compartir publicación",
          text: post.content,
          url: `${window.location.origin}/post/${post.id}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleShareToProfile = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para compartir",
        });
        return;
      }

      // Crear una nueva publicación que hace referencia a la original
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: `Compartido: ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`,
          user_id: userId,
          media_url: post.media_url,
          media_type: post.media_type,
          visibility: 'public',
          shared_from: post.id
        });

      if (error) {
        console.error("Error sharing post:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo compartir la publicación",
        });
      } else {
        // Invalidate the posts query to refresh the feed
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        
        toast({
          title: "¡Publicación compartida!",
          description: "La publicación ha sido compartida en tu perfil",
        });
        setShowShareOptions(false);
      }
    } catch (error) {
      console.error("Error in share function:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al compartir la publicación",
      });
    }
  };

  return (
    <div className="space-y-2">
      {/* Interactions Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        {totalReactions > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-auto p-0">
                <ReactionSummary reactions={reactionsByType} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Reacciones</DialogTitle>
              </DialogHeader>
              <ReactionDetails post={post} />
            </DialogContent>
          </Dialog>
        )}
        
        {commentCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0"
            onClick={onCommentsClick}
          >
            {commentCount} {commentCount === 1 ? "comentario" : "comentarios"}
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 border-t border-b py-1">
        <ReactionButton 
          userReaction={userReaction} 
          onReactionClick={onReaction}
          postId={post.id}
        />

        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={onToggleComments}
        >
          <MessagesSquare className="h-4 w-4 mr-2" />
          Comentar
        </Button>

        <DropdownMenu open={showShareOptions} onOpenChange={setShowShareOptions}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex-1">
              <Share className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleShareToProfile}>
              <Share className="h-4 w-4 mr-2" />
              Compartir en mi perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              <Link2 className="h-4 w-4 mr-2" />
              Copiar enlace
            </DropdownMenuItem>
            {navigator.share && (
              <DropdownMenuItem onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Compartir con...
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
