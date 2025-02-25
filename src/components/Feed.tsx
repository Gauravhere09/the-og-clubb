
import { useQuery } from "@tanstack/react-query";
import { Post } from "@/components/Post";
import { getPosts } from "@/lib/api";
import type { Post as PostType, Poll } from "@/types/post";
import { Card } from "./ui/card";

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
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", userId],
    queryFn: () => getPosts(userId),
    select: (data) => {
      return data.map(post => ({
        ...post,
        poll: transformPoll(post.poll)
      }));
    }
  });

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
