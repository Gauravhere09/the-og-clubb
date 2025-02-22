
export interface NotificationTable {
  Row: {
    id: string;
    type: 'post_like' | 'post_comment' | 'comment_reply' | 'new_post';
    sender_id: string;
    receiver_id: string;
    created_at: string;
    post_id?: string;
    comment_id?: string;
  };
  Insert: {
    id?: string;
    type: 'post_like' | 'post_comment' | 'comment_reply' | 'new_post';
    sender_id: string;
    receiver_id: string;
    created_at?: string;
    post_id?: string;
    comment_id?: string;
  };
  Update: {
    id?: string;
    type?: 'post_like' | 'post_comment' | 'comment_reply' | 'new_post';
    sender_id?: string;
    receiver_id?: string;
    created_at?: string;
    post_id?: string;
    comment_id?: string;
  };
}
