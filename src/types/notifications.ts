
export type NotificationType = 'friend_request' | 'message' | 'like' | 'new_post' | 'post_like';

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
