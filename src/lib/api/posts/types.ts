
import { Post, Poll } from "@/types/post";

export interface PollData {
  question: string;
  options: string[];
}

export interface IdeaData {
  title: string;
  description: string;
}

export interface CreatePostParams {
  content: string;
  file?: File | null;
  pollData?: PollData;
  ideaData?: IdeaData;
  visibility?: 'public' | 'friends' | 'incognito';
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

export interface TransformedIdea {
  title: string;
  description: string;
  participants: Array<{
    user_id: string;
    profession: string;
    joined_at: string;
    username?: string;
    avatar_url?: string;
  }>;
}
