
import { type Post, type Poll } from "@/types/post";
import { useState } from "react";
import { PollDisplay } from "@/components/post/PollDisplay";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface PostContentProps {
  post: Post;
  postId: string;
}

export function PostContent({ post, postId }: PostContentProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  
  const content = post.content;
  const isLongText = content.length > 280;
  const displayedContent = showFullContent ? content : content.slice(0, 280);
  
  // Function to get first name from full name
  const getFirstName = (fullName: string) => {
    return fullName?.split(' ')[0] || 'Usuario';
  };

  return (
    <div className="space-y-3 py-2">
      {/* If this is a shared post, show the original poster */}
      {post.shared_from && post.profiles && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Share className="h-4 w-4" />
          <span>Compartido por {post.profiles.username}</span>
        </div>
      )}
      
      <div>
        {isLongText && !showFullContent ? (
          <>
            <p>{displayedContent}...</p>
            <button
              onClick={() => setShowFullContent(true)}
              className="text-sm text-primary hover:underline mt-1"
            >
              Ver más
            </button>
          </>
        ) : (
          <p className="whitespace-pre-line">{displayedContent}</p>
        )}
        
        {showFullContent && isLongText && (
          <button
            onClick={() => setShowFullContent(false)}
            className="text-sm text-primary hover:underline mt-1"
          >
            Ver menos
          </button>
        )}
      </div>

      {post.media_url && post.media_type === "image" && (
        <div className="rounded-lg overflow-hidden">
          <img
            src={post.media_url}
            alt="Post media"
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      {post.media_url && post.media_type === "video" && (
        <div className="rounded-lg overflow-hidden">
          <video
            src={post.media_url}
            controls
            className="w-full max-h-96"
          />
        </div>
      )}

      {post.media_url && post.media_type === "audio" && (
        <div className="rounded-lg overflow-hidden bg-muted p-2">
          <audio
            src={post.media_url}
            controls
            className="w-full"
          />
        </div>
      )}

      {post.poll && (
        <PollDisplay poll={post.poll} postId={postId} />
      )}
    </div>
  );
}
