
import { Button } from "@/components/ui/button";
import { ThumbsUp, Heart, Laugh, Frown, Angry, MessagesSquare, Share } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import type { Post } from "@/types/post";

interface PostActionsProps {
  post: Post;
  onReaction: (type: 'like' | 'love' | 'haha' | 'sad' | 'angry') => void;
  onToggleComments: () => void;
}

const reactionIcons = {
  like: { icon: ThumbsUp, color: "text-blue-500" },
  love: { icon: Heart, color: "text-red-500" },
  haha: { icon: Laugh, color: "text-yellow-500" },
  sad: { icon: Frown, color: "text-yellow-500" },
  angry: { icon: Angry, color: "text-orange-500" }
};

export function PostActions({ post, onReaction, onToggleComments }: PostActionsProps) {
  return (
    <div className="flex gap-4">
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
            {Object.entries(reactionIcons).map(([type, { icon: Icon, color }]) => (
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
