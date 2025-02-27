
import { supabase } from "@/integrations/supabase/client";

export async function sendNewPostNotifications(userId: string, postId: string) {
  // Get all friends to notify about new post
  const { data: friendships } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId)
    .eq('status', 'accepted');

  if (friendships && friendships.length > 0) {
    const notifications = friendships.map(friendship => ({
      type: 'new_post',
      sender_id: userId,
      receiver_id: friendship.friend_id,
      post_id: postId,
      message: 'Ha realizado una nueva publicación',
      read: false
    }));

    await supabase
      .from('notifications')
      .insert(notifications);
  }
}
