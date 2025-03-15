
import { useAuthState } from "./reactions/use-auth-state";
import { useAuthCheck } from "./reactions/use-auth-check";
import { usePostReaction } from "./reactions/use-post-reaction";
import { useCommentReaction } from "./reactions/use-comment-reaction";

export function useReactionMutations(postId: string) {
  const { sessionChecked, hasValidSession, setHasValidSession } = useAuthState();
  const { checkAuth } = useAuthCheck(sessionChecked, hasValidSession, setHasValidSession);
  const { handleReaction } = usePostReaction(postId, checkAuth);
  const { toggleCommentReaction } = useCommentReaction(postId, checkAuth);
  
  return {
    handleReaction,
    toggleCommentReaction,
    isAuthenticated: hasValidSession,
    checkAuth
  };
}
