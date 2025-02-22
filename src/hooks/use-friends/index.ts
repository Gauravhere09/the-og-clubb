export interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
  status?: 'pending' | 'accepted' | 'rejected';
}
