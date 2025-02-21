
import { Button } from "@/components/ui/button";
import { 
  ThumbsUp, 
  Heart, 
  Laugh,
  Angry,
  MessagesSquare, 
  Share 
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import type { Post } from "@/types/post";

interface PostActionsProps {
  post: Post;
  onReaction: (type: 'like' | 'love' | 'haha' | 'angry') => void;
  onToggleComments: () => void;
}

const reactionIcons = {
  like: { icon: ThumbsUp, color: "text-blue-500", label: "Me gusta" },
  love: { icon: Heart, color: "text-red-500", label: "Me encanta" },
  haha: { icon: Laugh, color: "text-yellow-500", label: "Me divierte" },
  angry: { icon: Angry, color: "text-orange-500", label: "Me enoja" }
} as const;

type ReactionType = keyof typeof reactionIcons;

export function PostActions({ post, onReaction, onToggleComments }: PostActionsProps) {
  const reactionsByType = post.reactions?.by_type || {};
  const userReaction = post.user_reaction as ReactionType | undefined;
  const totalReactions = Object.values(reactionsByType).reduce((sum, count) => sum + count, 0);

  // Ordenar las reacciones por cantidad y obtener las más usadas
  const sortedReactions = Object.entries(reactionsByType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-2">
      {/* Mostrar resumen de reacciones si hay alguna */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1 px-2 text-sm text-muted-foreground">
          <div className="flex -space-x-1">
            {sortedReactions.map(([type]) => {
              const Icon = reactionIcons[type as ReactionType].icon;
              return (
                <div 
                  key={type}
                  className={`w-4 h-4 rounded-full bg-background shadow-sm flex items-center justify-center ${reactionIcons[type as ReactionType].color}`}
                >
                  <Icon className="w-3 h-3" />
                </div>
              );
            })}
          </div>
          <span>Tú y {totalReactions - 1} personas más</span>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`${userReaction ? reactionIcons[userReaction].color : ''} relative group`}
            >
              {userReaction ? (
                <div className="flex items-center">
                  {React.createElement(reactionIcons[userReaction].icon, {
                    className: "h-4 w-4 mr-2"
                  })}
                  {reactionIcons[userReaction].label}
                </div>
              ) : (
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Me gusta
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-fit p-2" 
            side="top"
            align="start"
            sideOffset={5}
          >
            <div className="flex gap-1">
              {Object.entries(reactionIcons).map(([type, { icon: Icon, color, label }]) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className={`hover:${color} ${userReaction === type ? color : ''} relative group hover:scale-125 transition-transform duration-200`}
                  onClick={() => onReaction(type as ReactionType)}
                >
                  <Icon className={`h-6 w-6 ${userReaction === type ? color : ''}`} />
                  <span className="absolute -top-8 scale-0 transition-all rounded bg-black px-2 py-1 text-xs text-white group-hover:scale-100 whitespace-nowrap">
                    {label}
                  </span>
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
