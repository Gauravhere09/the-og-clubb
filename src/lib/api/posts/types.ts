
import { Post, Poll } from "@/types/post";

export interface PollData {
  question: string;
  options: string[];
}

export interface CreatePostParams {
  content: string;
  file?: File | null;
  pollData?: PollData;
  visibility?: 'public' | 'friends' | 'private';
}

export interface TransformedPoll {
  question: string;
  options: Array<{
    id: string;
    content: string;
    votes: number;
  }>;
  total_votes: number;
  user_vote: string | null;
}
