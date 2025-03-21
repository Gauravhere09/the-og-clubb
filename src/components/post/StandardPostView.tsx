
import { PostContent } from "@/components/post/PostContent";
import { SharedPostContent } from "./SharedPostContent";
import type { Post } from "@/types/post";

interface StandardPostViewProps {
  post: Post;
}

export function StandardPostView({ post }: StandardPostViewProps) {
  return (
    <>
      <PostContent 
        post={post} 
        postId={post.id}
      />
      
      {post.shared_post && (
        <div className="mt-2">
          <SharedPostContent post={post.shared_post} />
        </div>
      )}
    </>
  );
}
