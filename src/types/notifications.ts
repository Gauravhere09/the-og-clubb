
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
}

export type DatabaseNotification = Database['public']['Tables']['notifications']['Row'];
export type DatabaseNotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type DatabaseNotificationUpdate = Database['public']['Tables']['notifications']['Update'];
