
import { Button } from "@/components/ui/button";
import { ThumbsUp, Heart, Laugh, MessagesSquare, Share } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import type { Post } from "@/types/post";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface PostActionsProps {
  post: Post;
  onReaction: (type: 'like' | 'love' | 'haha') => void;
  onToggleComments: () => void;
}

const reactionIcons = {
  like: { icon: ThumbsUp, color: "text-blue-500", label: "Me gusta" },
  love: { icon: Heart, color: "text-red-500", label: "Me encanta" },
  haha: { icon: Laugh, color: "text-yellow-500", label: "Me divierte" }
} as const;

type ReactionType = keyof typeof reactionIcons;

export function PostActions({ post, onReaction, onToggleComments }: PostActionsProps) {
  const reactionsByType = post.reactions?.by_type || {};
  const userReaction = post.user_reaction as ReactionType | undefined;

  const getReactionCount = (type: ReactionType) => reactionsByType[type] || 0;
  
  const totalReactions = Object.values(reactionsByType).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex gap-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={userReaction ? reactionIcons[userReaction].color : ""}
              >
                {userReaction ? (
                  <div className="flex items-center">
                    {React.createElement(reactionIcons[userReaction].icon, {
                      className: "h-4 w-4 mr-2"
                    })}
                    {totalReactions}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {totalReactions}
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-2">
              <div className="flex gap-2">
                {Object.entries(reactionIcons).map(([type, { icon: Icon, color }]) => (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className={`hover:${color} ${userReaction === type ? color : ''}`}
                    onClick={() => onReaction(type as ReactionType)}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </HoverCardTrigger>
        <HoverCardContent className="w-48">
          <div className="space-y-2">
            {Object.entries(reactionIcons).map(([type, { icon: Icon, color, label }]) => {
              const count = getReactionCount(type as ReactionType);
              if (count > 0) {
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span>{label}</span>
                    </div>
                    <span>{count}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </HoverCardContent>
      </HoverCard>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleComments}
      >
        <MessagesSquare className="h-4 w-4 mr-2" />
        {post.comments_count || 0}
      </Button>
      <Button variant="ghost" size="sm">
        <Share className="h-4 w-4 mr-2" />
        Compartir
      </Button>
    </div>
  );
}
