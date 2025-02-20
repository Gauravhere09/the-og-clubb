
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
}
