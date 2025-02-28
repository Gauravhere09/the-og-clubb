
import { Post as PostType } from "@/types/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PollDisplay } from "./PollDisplay";

interface SharedPostContentProps {
  post: PostType;
}

export function SharedPostContent({ post }: SharedPostContentProps) {
  if (!post) return null;
  
  const createdAt = new Date(post.created_at);
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: es });

  return (
    <Card className="p-3 border border-border/40 bg-background/50">
      <div className="flex items-start gap-2 mb-2">
        <Link to={`/profile/${post.user_id}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.profiles?.avatar_url || undefined} />
            <AvatarFallback>
              {post.profiles?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <Link to={`/profile/${post.user_id}`} className="font-semibold hover:underline text-sm">
              {post.profiles?.username || "Usuario"}
            </Link>
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <p className="text-sm whitespace-pre-wrap break-words">{post.content}</p>
        
        {post.media_url && post.media_type === 'image' && (
          <div className="mt-3 rounded-lg overflow-hidden relative">
            <img 
              src={post.media_url} 
              alt="Imagen de la publicación" 
              className="w-full h-auto object-cover max-h-[300px]"
            />
          </div>
        )}

        {post.poll && (
          <div className="mt-3">
            <PollDisplay 
              poll={post.poll} 
              postId={post.id}
              disabled={true}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
