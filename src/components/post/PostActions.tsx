
import { Button } from "@/components/ui/button";
import { MessagesSquare, Share } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React from "react";
import type { Post } from "@/types/post";
import { ReactionSummary } from "./reactions/ReactionSummary";
import { ReactionDetails } from "./reactions/ReactionDetails";
import { ReactionButton } from "./reactions/ReactionButton";
import { type ReactionType } from "./reactions/ReactionIcons";

interface PostActionsProps {
  post: Post;
  onReaction: (type: 'like' | 'love' | 'haha' | 'angry' | 'surprised' | 'sigma') => void;
  onToggleComments: () => void;
}

export function PostActions({ post, onReaction, onToggleComments }: PostActionsProps) {
  const reactionsByType = post.reactions?.by_type || {};
  const userReaction = post.user_reaction as ReactionType | undefined;
  const totalReactions = Object.values(reactionsByType).reduce((sum, count) => sum + count, 0);

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

      <div className="flex gap-4">
        <ReactionButton 
          userReaction={userReaction} 
          onReactionClick={onReaction} 
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleComments}
        >
          <MessagesSquare className="h-4 w-4 mr-2" />
          Comentar
        </Button>

        <Button variant="ghost" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Compartir
        </Button>
      </div>
    </div>
  );
}
