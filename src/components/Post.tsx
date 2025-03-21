
import { PostHeader } from "@/components/post/PostHeader";
import { PostActions } from "@/components/post/PostActions";
import { Comments } from "@/components/post/Comments";
import { PostWrapper } from "./post/PostWrapper";
import { StandardPostView } from "./post/StandardPostView";
import { SharedPostView } from "./post/SharedPostView";
import { usePost } from "@/hooks/use-post";
import type { Post as PostType } from "@/types/post";

interface PostProps {
  post: PostType;
  hideComments?: boolean;
  isHidden?: boolean;
}

export function Post({ post, hideComments = false, isHidden = false }: PostProps) {
  const {
    showComments,
    comments,
    newComment,
    commentImage,
    setCommentImage,
    replyTo,
    isCurrentUserAuthor,
    onDeletePost,
    onReaction,
    toggleComments,
    handleCommentReaction,
    handleReply,
    handleSubmitComment,
    handleCancelReply,
    handleDeleteComment,
    setNewComment
  } = usePost(post, hideComments);

  // Determine if this is a shared post by checking shared_post
  const isSharedPost = !!post.shared_post;

  return (
    <PostWrapper isHidden={isHidden}>
      <PostHeader 
        post={post} 
        onDelete={onDeletePost}
        isAuthor={isCurrentUserAuthor}
        isHidden={isHidden}
        content={post.content || ""}
      />
      
      {isSharedPost ? (
        <SharedPostView post={post} />
      ) : (
        <StandardPostView post={post} />
      )}
      
      <PostActions 
        post={post} 
        onReaction={(type) => onReaction(post.id, type)} 
        onToggleComments={toggleComments}
        onCommentsClick={toggleComments}
        commentsExpanded={showComments}
      />
      
      {!hideComments && (
        <Comments 
          postId={post.id}
          comments={comments}
          onReaction={handleCommentReaction}
          onReply={handleReply}
          onSubmitComment={handleSubmitComment}
          onDeleteComment={handleDeleteComment}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
          showComments={showComments}
          commentImage={commentImage}
          setCommentImage={setCommentImage}
        />
      )}
    </PostWrapper>
  );
}
