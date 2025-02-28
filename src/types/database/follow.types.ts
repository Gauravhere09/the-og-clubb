
export interface PopularUserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  followers_count: number;
  career: string | null;
  semester: string | null;
}

export interface ProfileFollow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  following: boolean;
}

export type FollowStatus = 'following' | 'not_following';
