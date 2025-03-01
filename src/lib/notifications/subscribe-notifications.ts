
import { supabase } from "@/integrations/supabase/client";
import type { NotificationWithSender, NotificationType } from "@/types/notifications";
import { formatNotificationMessage } from "./format-message";

export function subscribeToNotifications(
  callback: (notification: NotificationWithSender) => void,
  toastCallback: (title: string, description: string) => void
) {
  const channel = supabase
    .channel('notifications-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      },
      async (payload) => {
        // Fetch sender info for the new notification
        const { data: senderData, error: senderError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', payload.new.sender_id)
          .single();
        
        if (senderError) {
          console.error('Error fetching sender info:', senderError);
          return;
        }
        
        let postContent, postMedia, commentContent;
        
        // Fetch post data if this notification is related to a post
        if (payload.new.post_id) {
          const { data: postData } = await supabase
            .from('posts')
            .select('content, media_url')
            .eq('id', payload.new.post_id)
            .single();
            
          if (postData) {
            postContent = postData.content;
            postMedia = postData.media_url;
          }
        }
        
        // Fetch comment data if this notification is related to a comment
        if (payload.new.comment_id) {
          const { data: commentData } = await supabase
            .from('comments')
            .select('content')
            .eq('id', payload.new.comment_id)
            .single();
            
          if (commentData) {
            commentContent = commentData.content;
          }
        }
        
        if (senderData) {
          const newNotification: NotificationWithSender = {
            id: payload.new.id,
            type: payload.new.type as NotificationType,
            created_at: payload.new.created_at,
            message: payload.new.message ?? undefined,
            post_id: payload.new.post_id ?? undefined,
            comment_id: payload.new.comment_id ?? undefined,
            read: payload.new.read,
            sender_id: senderData.id,
            receiver_id: payload.new.receiver_id,
            sender: {
              id: senderData.id,
              username: senderData.username,
              avatar_url: senderData.avatar_url,
              full_name: undefined // We don't have full_name in the profiles table
            },
            post_content: postContent,
            post_media: postMedia,
            comment_content: commentContent
          };

          callback(newNotification);
          
          // Play notification sound
          const notificationSound = new Audio("/notification.mp3");
          notificationSound.play().catch(console.error);
          
          toastCallback(
            "Nueva notificación",
            formatNotificationMessage(payload.new.type, senderData.username)
          );
        }
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}
