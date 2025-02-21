
import { Button } from "@/components/ui/button";
import { 
  ThumbsUp, 
  Heart, 
  Laugh,
  Angry,
  MessagesSquare, 
  Share,
  Sigma
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import React from "react";
import type { Post } from "@/types/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostActionsProps {
  post: Post;
  onReaction: (type: 'like' | 'love' | 'haha' | 'angry' | 'surprised' | 'sigma') => void;
  onToggleComments: () => void;
}

const reactionIcons = {
  like: { icon: ThumbsUp, color: "text-blue-500", label: "Me gusta" },
  love: { icon: Heart, color: "text-red-500", label: "Me encanta" },
  haha: { icon: Laugh, color: "text-yellow-500", label: "Me divierte" },
  angry: { icon: Angry, color: "text-orange-500", label: "Me enoja" },
  surprised: { icon: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="4" fill="currentColor"/>
      <circle cx="8" cy="9" r="1.5" fill="currentColor"/>
      <circle cx="16" cy="9" r="1.5" fill="currentColor"/>
    </svg>
  ), color: "text-purple-500", label: "Me asombra" },
  sigma: { icon: Sigma, color: "text-gray-700", label: "Sigma" }
} as const;

type ReactionType = keyof typeof reactionIcons;

const ReactionSummary = ({ reactions }: { reactions: Record<string, number> }) => {
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  const sortedReactions = Object.entries(reactions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-1">
        {sortedReactions.map(([type]) => {
          const Icon = reactionIcons[type as ReactionType].icon;
          return (
            <div 
              key={type}
              className={`w-4 h-4 rounded-full bg-background shadow-sm flex items-center justify-center ${reactionIcons[type as ReactionType].color}`}
            >
              {typeof Icon === 'function' && <Icon className="w-3 h-3" />}
            </div>
          );
        })}
      </div>
      <span className="text-sm text-muted-foreground">
        {totalReactions} {totalReactions === 1 ? 'reacción' : 'reacciones'}
      </span>
    </div>
  );
};

const ReactionDetails = ({ post }: { post: Post }) => {
  const reactions = post.reactions?.by_type || {};
  const tabs = Object.entries(reactions).map(([type, count]) => ({
    type,
    count,
    label: reactionIcons[type as ReactionType].label
  }));

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="all">
          Todas ({Object.values(reactions).reduce((a, b) => a + b, 0)})
        </TabsTrigger>
        {tabs.map(({ type, count, label }) => (
          <TabsTrigger key={type} value={type}>
            {label} ({count})
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="all" className="mt-4">
        <div className="space-y-4">
          {/* Aquí iría la lista de usuarios que han reaccionado */}
          <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">Usuario</p>
            </div>
            <div className={reactionIcons.like.color}>
              <ThumbsUp className="h-4 w-4" />
            </div>
          </div>
        </div>
      </TabsContent>
      {tabs.map(({ type }) => (
        <TabsContent key={type} value={type}>
          {/* Aquí iría la lista filtrada por tipo de reacción */}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export function PostActions({ post, onReaction, onToggleComments }: PostActionsProps) {
  const reactionsByType = post.reactions?.by_type || {};
  const userReaction = post.user_reaction as ReactionType | undefined;
  const totalReactions = Object.values(reactionsByType).reduce((sum, count) => sum + count, 0);

  const handleReactionClick = (type: ReactionType) => {
    onReaction(type);
  };

  return (
    <div className="space-y-2">
      {/* Mostrar resumen de reacciones si hay alguna */}
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

      {/* Botones de acción */}
      <div className="flex gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`${userReaction ? reactionIcons[userReaction].color : ''} group`}
              onClick={() => userReaction && handleReactionClick(userReaction)}
            >
              {userReaction ? (
                <div className="flex items-center">
                  {typeof reactionIcons[userReaction].icon === 'function' && React.createElement(reactionIcons[userReaction].icon, {
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
                  onClick={() => handleReactionClick(type as ReactionType)}
                >
                  {typeof Icon === 'function' && <Icon className={`h-6 w-6 ${userReaction === type ? color : ''}`} />}
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
