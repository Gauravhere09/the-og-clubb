
import { Card } from "@/components/ui/card";
import type { Post as PostType } from "@/types/post";
import { PostHeader } from "./post/PostHeader";
import { PostContent } from "./post/PostContent";
import { PostActions } from "./post/PostActions";
import { Comments } from "./post/Comments";
import { usePostMutations } from "@/hooks/use-post-mutations";
import { type ReactionType } from "./reactions/ReactionIcons";

interface PostProps {
  post: PostType;
}

export function Post({ post }: PostProps) {
  const { handleReaction, handleDeletePost, toggleCommentReaction } = usePostMutations(post.id);

  const handleToggleComments = () => {
    // Handle toggle comments visibility if needed
  };

  const handleCommentReaction = (commentId: string, type: ReactionType) => {
    toggleCommentReaction({ commentId, type });
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <PostHeader post={post} onDelete={handleDeletePost} />
        <PostContent post={post} postId={post.id} />
        <PostActions
          post={post}
          onReaction={handleReaction}
          onToggleComments={handleToggleComments}
        />
      </div>
      <Comments
        postId={post.id}
        onReaction={handleCommentReaction}
      />
    </Card>
  );
}
