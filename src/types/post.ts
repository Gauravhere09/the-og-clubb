
export interface PollOption {
  id: string;
  content: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  total_votes: number;
  user_vote?: string | null;
}

export interface Idea {
  title: string;
  description: string;
  participants: IdeaParticipant[];
}

export interface IdeaParticipant {
  user_id: string;
  profession: string;
  joined_at: string;
  username?: string;
  avatar_url?: string;
}

export interface Post {
  id: string;
  content: string;
  user_id: string;
  media_url: string | null;
  media_type: 'image' | 'video' | 'audio' | null;
  visibility: 'public' | 'friends' | 'incognito';
  created_at: string;
  updated_at: string;
  poll?: Poll | null;
  idea?: Idea | null;
  shared_from?: string | null;
  shared_post?: Post | null; // Original post if this is a shared post
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
  comments?: { count: number }[];
  reactions?: {
    count: number;
    by_type: Record<string, number>;
  };
  reactions_count?: number;
  user_reaction?: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | null;
  comments_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  media_url?: string | null;
  media_type?: string | null;
  profiles?: {
    username: string;
    avatar_url: string;
  };
  likes_count?: number;
  user_reaction?: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | null;
  replies?: Comment[];
}
