
import { Card } from "@/components/ui/card";
import { Comments } from "@/components/post/Comments";
import { PostActions } from "@/components/post/PostActions";
import { PostContent } from "@/components/post/PostContent";
import { PostHeader } from "@/components/post/PostHeader";
import { type Post as PostType } from "@/types/post";
import { SharedPostContent } from "./post/SharedPostContent";
import { usePost } from "@/hooks/use-post";
import { PostWrapper } from "./post/PostWrapper";
import { PostOptionsMenu } from "./post/actions/PostOptionsMenu";

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
      
      {/* El resto del componente se mantiene igual */}
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

// Helper component for shared post view
function SharedPostView({ post }: { post: PostType }) {
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

// Helper component for standard post view
function StandardPostView({ post }: { post: PostType }) {
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
