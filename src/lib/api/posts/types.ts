
import { Post, Poll } from "@/types/post";
import { Tables } from "@/types/database";

export type CreatePostInput = {
  content: string;
  file: File | null;
  pollData?: {
    question: string;
    options: string[];
  };
};

export type PostWithoutRelations = Omit<Post, 'profiles' | 'reactions' | 'reactions_count' | 'comments_count' | 'user_reaction'>;

export type RawPost = {
  id: string;
  content: string;
  user_id: string;
  media_url: string | null;
  media_type: string | null;
  visibility: string;
  poll: {
    question: string;
    options: Array<{
      id: string;
      content: string;
      votes: number;
    }>;
    total_votes: number;
    user_vote: string | null;
  } | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
};

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
