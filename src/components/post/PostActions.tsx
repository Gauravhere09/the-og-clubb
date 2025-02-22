
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

interface PostActionsProps {
  post: Post;
  onReaction: (type: ReactionType) => void;
  onToggleComments: () => void;
}

export function PostActions({ post, onReaction, onToggleComments }: PostActionsProps) {
  const { toast } = useToast();
  const reactionsByType = post.reactions?.by_type || {};
  const userReaction = post.user_reaction as ReactionType | undefined;
  const totalReactions = Object.values(reactionsByType).reduce((sum, count) => sum + count, 0);
  const commentCount = post.comments_count || 0;

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Compartir publicación',
          text: post.content,
          url: `${window.location.origin}/post/${post.id}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="space-y-2">
      {totalReactions > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="px-2">
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

      <div className="flex gap-4 border-t pt-2">
        <ReactionButton 
          userReaction={userReaction} 
          onReactionClick={onReaction} 
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleComments}
          className="relative"
        >
          {commentCount > 0 && (
            <span className="absolute -top-4 text-xs text-muted-foreground">
              {commentCount} {commentCount === 1 ? 'comentario' : 'comentarios'}
            </span>
          )}
          <MessagesSquare className="h-4 w-4 mr-2" />
          Comentar
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
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
