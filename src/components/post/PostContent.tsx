
import { Globe, Users, Lock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Post } from "@/types/post";

interface PostContentProps {
  post: Post;
}

export function PostContent({ post }: PostContentProps) {
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4" />;
      case 'friends':
        return <Users className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <>
      {post.content && (
        <div className="mb-4">
          <p>{post.content}</p>
          <div className="flex items-center gap-2 mt-1">
            {getVisibilityIcon(post.visibility)}
            <span className="text-xs text-muted-foreground capitalize">
              {post.visibility}
            </span>
          </div>
        </div>
      )}

      {post.media_url && (
        <div className="mb-4">
          {post.media_type === 'image' && (
            <img
              src={post.media_url}
              alt="Post media"
              className="w-full rounded-lg"
            />
          )}
          {post.media_type === 'video' && (
            <video
              src={post.media_url}
              controls
              className="w-full rounded-lg"
            />
          )}
          {post.media_type === 'audio' && (
            <div className="bg-secondary rounded-lg p-3 flex items-center gap-3">
              <Button variant="secondary" size="icon">
                <Play className="h-4 w-4" />
              </Button>
              <audio src={post.media_url} controls className="w-full" />
            </div>
          )}
        </div>
      )}
    </>
  );
}
