
export interface LikeTable {
  Row: {
    id: string;
    user_id: string;
    post_id: string | null;
    comment_id: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    post_id?: string | null;
    comment_id?: string | null;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    post_id?: string | null;
    comment_id?: string | null;
    created_at?: string;
  };
}

export interface FriendshipTable {
  Row: {
    id: string;
    user_id: string;
    friend_id: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    friend_id: string;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    friend_id?: string;
    created_at?: string;
  };
}

export interface FriendRequestTable {
  Row: {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    sender_id: string;
    receiver_id: string;
    status: string;
    created_at?: string;
  };
  Update: {
    id?: string;
    sender_id?: string;
    receiver_id?: string;
    status?: string;
    created_at?: string;
  };
}
