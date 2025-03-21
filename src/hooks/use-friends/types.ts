
export interface FriendSuggestion {
  id: string;
  username: string;
  avatar_url: string | null;
  mutual_friends_count?: number;
  career?: string;
  semester?: string;
}

export interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  status?: 'friends' | 'following' | 'follower';
}

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
  mutual_friends_count?: number;
}
