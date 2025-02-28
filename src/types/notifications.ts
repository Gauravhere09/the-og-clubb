
import type { Database } from "@/integrations/supabase/types";

export type NotificationType = 
  | 'friend_request' 
  | 'message' 
  | 'like' 
  | 'new_post' 
  | 'post_like' 
  | 'post_comment'
  | 'comment_reply'
  | 'friend_accepted';

export interface Notification {
  id: string;
  type: NotificationType;
  sender_id: string;
  receiver_id: string;
  post_id?: string;
  comment_id?: string;
  message?: string;
  created_at: string;
  read: boolean;
  post_content?: string;
  post_media?: string | null;
  comment_content?: string;
}

export interface DatabaseNotification {
  id: string;
  type: string;
  sender_id: string;
  receiver_id: string;
  message?: string;
  created_at: string;
  read: boolean;
  post_id?: string;
  comment_id?: string;
}

export type DatabaseNotificationInsert = Partial<DatabaseNotification>;
export type DatabaseNotificationUpdate = Partial<DatabaseNotification>;
