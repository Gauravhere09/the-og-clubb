
export type NotificationType = 'friend_request' | 'message' | 'like' | 'new_post' | 'post_like' | 'friend_accepted';

export interface Notification {
  id: string;
  type: NotificationType;
  sender_id: string;
  receiver_id: string;
  post_id?: string;
  message?: string;
  created_at: string;
  read: boolean;
}

// Update database type to match Supabase schema
export interface NotificationRow {
  id: string;
  type: string;
  sender_id: string;
  receiver_id: string;
  post_id?: string;
  message?: string;
  created_at: string;
  read: boolean;
}
