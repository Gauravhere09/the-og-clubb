
export interface Post {
  id: string;
  content: string;
  user_id: string;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  visibility: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
  comments?: { count: number };
  reactions?: { count: number };
  reactions_count?: number;
  user_reaction?: string | null;
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
  likes_count?: number;
  user_has_liked?: boolean;
  replies?: Comment[];
}
