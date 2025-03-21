
export interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  mutual_friends_count?: number;
  status?: 'following' | 'follower' | 'friends';
}

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'accepted' | 'pending' | 'rejected';
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
  mutual_friends?: {
    username: string;
    avatar_url: string | null;
  }[];
}

export interface FriendSuggestion {
  id: string;
  username: string;
  avatar_url: string | null;
  mutual_friends_count: number;
  career?: string | null;
  semester?: string | null;
  relevanceScore?: number;
  mutual_friends?: {
    username: string;
    avatar_url: string | null;
  }[];
}
