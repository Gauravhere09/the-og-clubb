
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
    sender_id: string | null;
    receiver_id: string;
    post_id: string | null;
    comment_id: string | null;
    type: string;
    message: string | null;
    read: boolean;
    created_at: string;
  };
  Insert: {
    id?: string;
    sender_id?: string | null;
    receiver_id: string;
    post_id?: string | null;
    comment_id?: string | null;
    type: string;
    message?: string | null;
    read?: boolean;
    created_at?: string;
  };
  Update: {
    id?: string;
    sender_id?: string | null;
    receiver_id?: string;
    post_id?: string | null;
    comment_id?: string | null;
    type?: string;
    message?: string | null;
    read?: boolean;
    created_at?: string;
  };
}
