export interface Post {
  id: string;
  content: string;
  user_id: string;
  media_url: string | null;
  media_type: 'image' | 'video' | 'audio' | null;
  visibility: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
  comments?: { count: number }[];
  likes?: {
    id: string;
    user_id: string;
    post_id: string;
    reaction_type: 'like' | 'love' | 'haha' | 'angry' | 'wow' | 'sad';
  }[];
  reactions?: {
    count: number;
    by_type: Record<string, number>;
  };
  reactions_count?: number;
  user_reaction?: 'like' | 'love' | 'haha' | 'angry' | 'wow' | 'sad' | null;
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
  profiles?: {
    username: string;
    avatar_url: string;
  };
  likes?: { count: number }[];
  likes_count?: number;
  user_has_liked?: boolean;
  user_reaction?: 'like' | 'love' | 'haha' | 'angry' | 'surprised' | 'sigma' | null;
  replies?: Comment[];
}
