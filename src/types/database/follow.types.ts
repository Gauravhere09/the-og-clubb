
export interface FollowersTable {
  Row: {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    follower_id: string;
    following_id: string;
    created_at?: string;
  };
  Update: {
    id?: string;
    follower_id?: string;
    following_id?: string;
    created_at?: string;
  };
}

export interface FollowStats {
  followers_count: number;
  following_count: number;
}

export interface PopularUserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  career: string | null;
  semester: string | null;
  followers_count: number;
}
