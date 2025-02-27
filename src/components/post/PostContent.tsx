
import { Post, Poll } from "@/types/post";
import { cn } from "@/lib/utils";
import { PollDisplay } from "./PollDisplay";

interface PostContentProps {
  post: Post;
  postId: string;
  onVote?: (optionId: string) => Promise<void>;
}

export function PostContent({ post, postId, onVote }: PostContentProps) {
  return (
    <div className="space-y-3 pt-2 pb-3">
      <div className={cn("whitespace-pre-wrap", !post.media_url && "mb-1")}>
        {post.content}
      </div>

      {post.media_url && (
        <div>
          {post.media_type === "image" && (
            <img
              src={post.media_url}
              alt="Post image"
              className="rounded-lg w-full object-cover max-h-[500px]"
            />
          )}
          {post.media_type === "video" && (
            <video
              src={post.media_url}
              className="rounded-lg w-full"
              controls
            />
          )}
          {post.media_type === "audio" && (
            <audio
              src={post.media_url}
              className="w-full mt-2"
              controls
            />
          )}
        </div>
      )}
      
      {post.poll && <PollDisplay postId={postId} poll={post.poll} onVote={onVote} />}
    </div>
  );
}
