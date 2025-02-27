
import { ReactionType } from "@/types/database/social.types";

export interface CommentData {
  content: string;
  replyToId?: string | null;
}

export interface CommentReactionParams {
  commentId: string;
  type: ReactionType;
}
