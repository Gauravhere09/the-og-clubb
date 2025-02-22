
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Post } from "@/components/Post";
import type { Post as PostType } from "@/types/post";

interface ProfileContentProps {
  profileId: string;
}

export function ProfileContent({ profileId }: ProfileContentProps) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["profile-posts", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles(username, avatar_url),
          comments(count),
          likes(id, user_id)
        `)
        .eq("user_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transformamos los datos para que coincidan con el tipo PostType
      return (data || []).map((post): PostType => ({
        ...post,
        media_type: post.media_type as 'image' | 'video' | 'audio' | null,
        visibility: post.visibility as 'public' | 'friends' | 'private',
        likes: post.likes?.map(like => ({
          ...like,
          post_id: post.id,
          reaction_type: 'like' as const
        })) || [],
        comments_count: post.comments?.[0]?.count || 0
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
