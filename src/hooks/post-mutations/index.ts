
import { useReactionMutations } from "./use-reaction-mutations";
import { usePostDeleteMutation } from "./use-post-delete-mutation";
import { useCommentMutations } from "./use-comment-mutations";
import { usePollVoteMutation } from "./use-poll-vote-mutation";
import { ReactionType } from "@/types/database/social.types";
import { CommentData } from "./types";

export function usePostMutations(postId: string) {
  const { handleReaction, toggleCommentReaction } = useReactionMutations(postId);
  const { handleDeletePost } = usePostDeleteMutation(postId);
  const { submitComment } = useCommentMutations(postId);
  const { submitVote } = usePollVoteMutation(postId);

  return {
    handleReaction,
    handleDeletePost,
    toggleCommentReaction,
    submitComment,
    submitVote
  };
}

export type { CommentData };
export { ReactionType };
