
import React from "react";
import { Post as PostComponent } from "@/components/Post";
import type { Post } from "@/types/post";

interface HiddenPostsProps {
  posts: Post[];
  show: boolean;
}

export function HiddenPosts({ posts, show }: HiddenPostsProps) {
  if (!show || posts.length === 0) return null;
  
  return (
    <>
      {posts.map(post => (
        <div key={post.id} className="relative mb-4">
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 opacity-10 z-0 pointer-events-none"></div>
          <PostComponent key={post.id} post={post} isHidden={true} />
        </div>
      ))}
    </>
  );
}
