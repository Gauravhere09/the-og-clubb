
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { usePostMutations, type ReactionType } from "@/hooks/use-post-mutations";
import { Comments } from "@/components/post/Comments";
import { PostActions } from "@/components/post/PostActions";
import { PostContent } from "@/components/post/PostContent";
import { PostHeader } from "@/components/post/PostHeader";
import { type Post as PostType } from "@/types/post";
import { SharedPostContent } from "./post/SharedPostContent";

interface PostProps {
  post: PostType;
  hideComments?: boolean;
}

export function Post({ post, hideComments = false }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const { addReaction } = usePostMutations();

  const handleReaction = (type: ReactionType) => {
    addReaction({
      postId: post.id,
      reactionType: type
    });
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentsClick = () => {
    setShowComments(true);
  };

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="p-4 space-y-4">
        <PostHeader post={post} />
        
        <PostContent post={post} />
        
        {post.shared_post && (
          <div className="mt-2">
            <SharedPostContent post={post.shared_post} />
          </div>
        )}
        
        <PostActions 
          post={post} 
          onReaction={handleReaction} 
          onToggleComments={toggleComments}
          onCommentsClick={handleCommentsClick}
        />
        
        {!hideComments && showComments && (
          <Comments postId={post.id} />
        )}
      </div>
    </Card>
  );
}
