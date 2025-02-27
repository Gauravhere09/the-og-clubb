
export interface FreiendshipRow {
  id: string;
  created_at: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface FriendProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface PopularUserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  career: string | null;
  semester: string | null;
  followers_count: number;
}
