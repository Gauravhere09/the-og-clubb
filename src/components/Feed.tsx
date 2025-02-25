
import { useQuery } from "@tanstack/react-query";
import { Post } from "@/components/Post";
import { getPosts } from "@/lib/api";
import type { Post as PostType, Poll } from "@/types/post";
import { Card } from "./ui/card";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

interface FeedProps {
  userId?: string;
}

function transformPoll(pollData: any): Poll | null {
  if (!pollData) return null;
  return {
    question: pollData.question,
    options: (pollData.options || []).map((opt: any) => ({
      id: opt.id,
      content: opt.content,
      votes: Number(opt.votes)
    })),
    total_votes: Number(pollData.total_votes),
    user_vote: pollData.user_vote
  };
}

export function Feed({ userId }: FeedProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const showNew = searchParams.get("new") === "true";

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", userId],
    queryFn: () => getPosts(userId),
    select: (data) => {
      let transformedPosts = data.map(post => ({
        ...post,
        poll: transformPoll(post.poll)
      }));

      if (showNew) {
        // Si estamos mostrando nuevos posts, ordenamos por fecha de creación descendente
        // y filtramos los posts de las últimas 24 horas
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.setHours() - 24);

        transformedPosts = transformedPosts.filter(post => {
          const postDate = new Date(post.created_at);
          return postDate > twentyFourHoursAgo;
        });
      }

      return transformedPosts;
    }
  });

  // Limpiar el parámetro "new" después de mostrar los nuevos posts
  useEffect(() => {
    if (showNew) {
      const timer = setTimeout(() => {
        setSearchParams({});
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showNew, setSearchParams]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </Card>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">
          No hay publicaciones para mostrar
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
