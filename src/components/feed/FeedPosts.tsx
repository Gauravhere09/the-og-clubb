
import React from "react";
import { Post as PostComponent } from "@/components/Post";
import type { Post } from "@/types/post";

interface FeedPostsProps {
  posts: Post[];
}

export function FeedPosts({ posts }: FeedPostsProps) {
  return (
    <>
      {posts.map(post => (
        <div key={post.id} className="mb-4">
          <PostComponent post={post} />
        </div>
      ))}
    </>
  );
}
