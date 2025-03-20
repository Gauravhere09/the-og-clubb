import { useQuery } from "@tanstack/react-query";
import { fetchComments } from "@/lib/api/posts/queries";
import { ReactionType } from "@/types/database/social.types";
import { Comment } from "@/types/post";

/**
 * Hook for managing post comments functionality
 */
export function usePostComments(
  postId: string, 
  showComments: boolean, 
  setReplyTo: (value: { id: string; username: string } | null) => void,
  setNewComment: (value: string) => void
) {
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    enabled: showComments
  });
  
  const handleCommentReaction = (commentId: string, type: ReactionType) => {
    // This function is a placeholder in the original code
    // We'll keep it for API consistency
  };
  
  const handleReply = (id: string, username: string) => {
    setReplyTo({ id, username });
    setNewComment(`@${username} `);
  };
  
  return {
    comments,
    handleCommentReaction,
    handleReply
  };
}
