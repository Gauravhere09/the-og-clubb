
import { supabase } from "@/integrations/supabase/client";

export async function handleFriendRequest(notificationId: string, senderId: string, accept: boolean) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    await supabase
      .from('friendships')
      .upsert({
        user_id: user.id,
        friend_id: senderId,
        status: accept ? 'accepted' : 'rejected'
      });

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    return true;
  } catch (error) {
    console.error('Error handling friend request:', error);
    return false;
  }
}

export async function markNotificationsAsRead(notificationIds?: string[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    let query = supabase
      .from('notifications')
      .update({ read: true });

    if (notificationIds && notificationIds.length > 0) {
      // Mark only the specified notifications
      query = query.in('id', notificationIds);
    } else {
      // Mark all notifications of the user
      query = query.eq('receiver_id', user.id);
    }

    await query;
    return true;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return false;
  }
}

export async function clearAllNotifications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    await supabase
      .from('notifications')
      .delete()
      .eq('receiver_id', user.id);
    
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
}
