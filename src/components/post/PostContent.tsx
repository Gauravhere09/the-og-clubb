
import { Globe, Users, Lock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Post, Poll } from "@/types/post";
import { PollDisplay } from "./PollDisplay";
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

interface PostContentProps {
  post: Post;
  postId: string;
}

export function PostContent({ post, postId }: PostContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
  });

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

  // Efecto para pausar videos cuando no están visibles o cuando se reproduce otro
  useEffect(() => {
    const currentVideo = videoRef.current;
    
    if (currentVideo) {
      // Pausar el video cuando no está en vista
      if (!inView && !currentVideo.paused) {
        currentVideo.pause();
      }

      // Event listener para pausar otros videos cuando este comienza a reproducirse
      const handlePlay = () => {
        document.querySelectorAll('video').forEach(video => {
          if (video !== currentVideo && !video.paused) {
            video.pause();
          }
        });
      };

      currentVideo.addEventListener('play', handlePlay);
      return () => {
        currentVideo.removeEventListener('play', handlePlay);
      };
    }
  }, [inView]);

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

      {post.poll && (
        <PollDisplay 
          poll={post.poll}
          postId={postId}
          onVote={() => {}}
        />
      )}

      {post.media_url && (
        <div className="mb-4" ref={inViewRef}>
          {post.media_type === 'image' && (
            <img
              src={post.media_url}
              alt="Post media"
              className="w-full rounded-lg"
            />
          )}
          {post.media_type === 'video' && (
            <video
              ref={videoRef}
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
