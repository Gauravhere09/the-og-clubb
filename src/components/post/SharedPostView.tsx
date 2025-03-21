
import { SharedPostContent } from "./SharedPostContent";
import type { Post } from "@/types/post";

interface SharedPostViewProps {
  post: Post;
}

export function SharedPostView({ post }: SharedPostViewProps) {
  return (
    <div>
      {post.content && (
        <p className="text-sm whitespace-pre-wrap break-words mb-4">{post.content}</p>
      )}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Publicación original
          </span>
        </div>
        {post.shared_post && (
          <SharedPostContent post={post.shared_post} />
        )}
      </div>
    </div>
  );
}
