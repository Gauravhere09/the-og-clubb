
import { Post, Poll, Idea } from "@/types/post";

export interface PollData {
  question: string;
  options: string[];
}

export interface IdeaData {
  description: string;
}

export interface CreatePostParams {
  content: string;
  file?: File | null;
  pollData?: PollData;
  ideaData?: IdeaData;
  visibility?: 'public' | 'friends' | 'incognito';
  post_type?: 'regular' | 'poll' | 'idea';
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
