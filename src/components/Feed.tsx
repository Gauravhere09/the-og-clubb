
import { useEffect } from "react";
import { Post as PostComponent } from "@/components/Post";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPosts } from "@/lib/api/posts";
import { supabase } from "@/integrations/supabase/client";
import type { Post, Poll } from "@/types/post";

interface FeedProps {
  userId?: string;
}

export function Feed({ userId }: FeedProps) {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', userId],
    queryFn: async () => {
      const rawPosts = await getPosts(userId);
      // Transform raw posts to ensure poll data is properly typed
      return rawPosts.map(post => ({
        ...post,
        poll: post.poll ? {
          question: (post.poll as any).question,
          options: (post.poll as any).options.map((opt: any) => ({
            id: opt.id,
            content: opt.content,
            votes: opt.votes
          })),
          total_votes: (post.poll as any).total_votes,
          user_vote: (post.poll as any).user_vote
        } as Poll : null,
        media_type: post.media_type as 'image' | 'video' | 'audio' | null,
        visibility: post.visibility as 'public' | 'friends' | 'private'
      })) as Post[];
    },
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
