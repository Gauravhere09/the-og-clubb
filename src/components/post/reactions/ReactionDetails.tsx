
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp } from "lucide-react";
import { reactionIcons, type ReactionType } from "./ReactionIcons";
import type { Post } from "@/types/post";

interface ReactionDetailsProps {
  post: Post;
}

export function ReactionDetails({ post }: ReactionDetailsProps) {
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
}
