
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Post } from "@/components/Post";
import type { Post as PostType, Poll } from "@/types/post";

interface ProfileContentProps {
  profileId: string;
}

export function ProfileContent({ profileId }: ProfileContentProps) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["profile-posts", profileId],
    queryFn: async () => {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          profiles(username, avatar_url)
        `)
        .eq("user_id", profileId)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      // Fetch all comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("post_id")
        .in("post_id", (postsData || []).map(p => p.id));

      if (commentsError) throw commentsError;

      // Fetch all reactions
      const { data: reactionsData, error: reactionsError } = await supabase
        .from("reactions")
        .select("post_id, reaction_type")
        .in("post_id", (postsData || []).map(p => p.id));

      if (reactionsError) throw reactionsError;

      // Count comments manually
      const commentsMap = (commentsData || []).reduce((acc, comment) => {
        acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Count reactions manually
      const reactionsMap = (reactionsData || []).reduce((acc, reaction) => {
        if (!acc[reaction.post_id]) {
          acc[reaction.post_id] = {
            count: 0,
            by_type: {}
          };
        }
        acc[reaction.post_id].count += 1;
        acc[reaction.post_id].by_type[reaction.reaction_type] = 
          (acc[reaction.post_id].by_type[reaction.reaction_type] || 0) + 1;
        return acc;
      }, {} as Record<string, { count: number, by_type: Record<string, number> }>);

      // Transform poll data
      const transformPoll = (pollData: unknown): Poll | null => {
        if (!pollData || typeof pollData !== 'object') return null;
        
        const poll = pollData as Record<string, unknown>;
        if (!poll.question || !poll.options || !Array.isArray(poll.options)) return null;

        return {
          question: String(poll.question),
          options: poll.options.map((opt: any) => ({
            id: String(opt.id),
            content: String(opt.content),
            votes: Number(opt.votes) || 0
          })),
          total_votes: Number(poll.total_votes) || 0,
          user_vote: poll.user_vote ? String(poll.user_vote) : null
        };
      };

      // Combine all data
      return (postsData || []).map((post): PostType => ({
        ...post,
        media_type: post.media_type as 'image' | 'video' | 'audio' | null,
        visibility: post.visibility as 'public' | 'friends' | 'private',
        poll: transformPoll(post.poll),
        reactions: reactionsMap[post.id] || { count: 0, by_type: {} },
        reactions_count: reactionsMap[post.id]?.count || 0,
        comments_count: commentsMap[post.id] || 0
      }));
    },
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        <h2 className="font-semibold mb-4">Publicaciones</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded-md" />
          <div className="h-24 bg-muted rounded-md" />
        </div>
      </Card>
    );
  }

  if (!posts?.length) {
    return (
      <Card className="p-4">
        <h2 className="font-semibold mb-4">Publicaciones</h2>
        <p className="text-muted-foreground text-center py-8">
          No hay publicaciones para mostrar
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="font-semibold mb-4">Publicaciones</h2>
      </Card>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
