
import { Button } from "@/components/ui/button";
import { ThumbsUp, Heart, Laugh, Frown, Angry, MessagesSquare, Share } from "lucide-react";
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
  onReaction: (type: 'like' | 'love' | 'haha' | 'sad' | 'angry') => void;
  onToggleComments: () => void;
}

const reactionIcons = {
  like: { icon: ThumbsUp, color: "text-blue-500", label: "Me gusta" },
  love: { icon: Heart, color: "text-red-500", label: "Me encanta" },
  haha: { icon: Laugh, color: "text-yellow-500", label: "Me divierte" },
  sad: { icon: Frown, color: "text-yellow-500", label: "Me entristece" },
  angry: { icon: Angry, color: "text-orange-500", label: "Me enoja" }
};

export function PostActions({ post, onReaction, onToggleComments }: PostActionsProps) {
  const reactionsByType = post.reactions?.by_type || {};

  return (
    <div className="flex gap-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={post.user_reaction ? reactionIcons[post.user_reaction].color : ""}
              >
                {post.user_reaction ? (
                  <div className="flex items-center">
                    {React.createElement(reactionIcons[post.user_reaction].icon, {
                      className: "h-4 w-4 mr-2"
                    })}
                    {post.reactions_count || 0}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {post.reactions_count || 0}
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-2">
              <div className="flex gap-1">
                {Object.entries(reactionIcons).map(([type, { icon: Icon, color, label }]) => (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className={`hover:${color} ${post.user_reaction === type ? color : ''}`}
                    onClick={() => onReaction(type as 'like' | 'love' | 'haha' | 'sad' | 'angry')}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </HoverCardTrigger>
        <HoverCardContent className="w-48">
          <div className="space-y-1">
            {Object.entries(reactionsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {React.createElement(reactionIcons[type].icon, {
                    className: `h-4 w-4 ${reactionIcons[type].color}`
                  })}
                  <span>{reactionIcons[type].label}</span>
                </div>
                <span>{count}</span>
              </div>
            ))}
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
