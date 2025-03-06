
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { reactionIcons, type ReactionType } from "./ReactionIcons";
import type { Post } from "@/types/post";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReactionDetailsProps {
  post: Post;
}

interface UserReaction {
  profile: {
    username: string;
    avatar_url: string | null;
  };
  reaction_type: ReactionType;
}

export function ReactionDetails({ post }: ReactionDetailsProps) {
  const { data: userReactions = [] } = useQuery({
    queryKey: ["post-reactions", post.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reactions')
        .select(`
          reaction_type,
          profile:user_id (
            username,
            avatar_url
          )
        `)
        .eq('post_id', post.id);

      if (error) throw error;
      
      // Filter out duplicate reactions from the same user for each reaction type
      const userIds = new Set();
      return (data as UserReaction[]).filter(reaction => {
        const userIdentifier = `${reaction.profile.username}-${reaction.reaction_type}`;
        if (userIds.has(userIdentifier)) {
          return false;
        }
        userIds.add(userIdentifier);
        return true;
      });
    }
  });

  const reactions = post.reactions?.by_type || {};
  const tabs = Object.entries(reactions).map(([type, count]) => ({
    type,
    count,
    label: reactionIcons[type as ReactionType].label
  }));

  const getReactionsByType = (type?: ReactionType) => {
    return type 
      ? userReactions.filter(r => r.reaction_type === type)
      : userReactions;
  };

  const ReactionList = ({ reactions }: { reactions: UserReaction[] }) => (
    <div className="space-y-4">
      {reactions.map((reaction, index) => (
        <div key={index} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg">
          <Avatar className="h-8 w-8">
            <AvatarImage src={reaction.profile.avatar_url || ''} />
            <AvatarFallback>
              {reaction.profile.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{reaction.profile.username || 'Usuario'}</p>
          </div>
          <div className={reactionIcons[reaction.reaction_type].color}>
            {React.createElement(reactionIcons[reaction.reaction_type].icon, { className: "h-4 w-4" })}
          </div>
        </div>
      ))}
      {reactions.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          No hay reacciones aún
        </p>
      )}
    </div>
  );

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="all">
          Todas ({userReactions.length})
        </TabsTrigger>
        {tabs.map(({ type, count, label }) => (
          <TabsTrigger key={type} value={type}>
            {label} ({count})
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="all" className="mt-4">
        <ReactionList reactions={getReactionsByType()} />
      </TabsContent>
      {tabs.map(({ type }) => (
        <TabsContent key={type} value={type} className="mt-4">
          <ReactionList reactions={getReactionsByType(type as ReactionType)} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
