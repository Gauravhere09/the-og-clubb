
import { useEffect } from "react";
import { Post as PostComponent } from "@/components/Post";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPosts } from "@/lib/api/posts";
import { supabase } from "@/integrations/supabase/client";

interface FeedProps {
  userId?: string;
}

export function Feed({ userId }: FeedProps) {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', userId],
    queryFn: () => getPosts(userId),
  });

  useEffect(() => {
    const channel = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-card rounded-lg shadow animate-pulse h-48"
          />
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="text-center p-8 bg-card rounded-lg">
        <p className="text-muted-foreground">No hay publicaciones para mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostComponent key={post.id} post={post} />
      ))}
    </div>
  );
}
