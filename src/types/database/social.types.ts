
export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface ReactionTable {
  Row: {
    id: string;
    user_id: string;
    post_id: string | null;
    comment_id: string | null;
    reaction_type: ReactionType;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    post_id?: string | null;
    comment_id?: string | null;
    reaction_type: ReactionType;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    post_id?: string | null;
    comment_id?: string | null;
    reaction_type?: ReactionType;
    created_at?: string;
  };
}

export interface NotificationTable {
  Row: {
    id: string;
    type: string;
    sender_id: string | null;
    receiver_id: string;
    post_id: string | null;
    comment_id: string | null;
    message: string | null;
    read: boolean;
    created_at: string;
  };
  Insert: {
    id?: string;
    type: string;
    sender_id?: string | null;
    receiver_id: string;
    post_id?: string | null;
    comment_id?: string | null;
    message?: string | null;
    read?: boolean;
    created_at?: string;
  };
  Update: {
    id?: string;
    type?: string;
    sender_id?: string | null;
    receiver_id?: string;
    post_id?: string | null;
    comment_id?: string | null;
    message?: string | null;
    read?: boolean;
    created_at?: string;
  };
}

export interface FriendshipTable {
  Row: {
    id: string;
    user_id: string;
    friend_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    friend_id: string;
    status?: 'pending' | 'accepted' | 'rejected';
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    friend_id?: string;
    status?: 'pending' | 'accepted' | 'rejected';
    created_at?: string;
  };
}

export interface Friend {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender: {
    username: string;
    avatar_url: string | null;
  };
}
