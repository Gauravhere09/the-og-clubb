
import { supabase } from "@/integrations/supabase/client";

export async function sendMentionNotifications(
  content: string,
  postId?: string,
  commentId?: string,
  senderId?: string
) {
  if (!senderId) {
    const { data } = await supabase.auth.getUser();
    senderId = data.user?.id;
    
    if (!senderId) return; // No authenticated user
  }
  
  try {
    // Extract mentions from content using regex
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]); // Extract username
    }
    
    if (mentions.length === 0) return; // No mentions found
    
    console.log("Found mentions:", mentions);
    
    // Get user IDs for the mentioned usernames
    const { data: mentionedUsers, error } = await supabase
      .from('profiles')
      .select('id, username')
      .in('username', mentions);
    
    if (error) {
      console.error("Error fetching mentioned users:", error);
      return;
    }
    
    console.log("Mentioned users data:", mentionedUsers);
    
    // Create notifications for each mentioned user
    for (const user of mentionedUsers) {
      // Skip notification if the sender is mentioning themselves
      if (user.id === senderId) continue;
      
      const notificationType = commentId ? 'comment_mention' : 'post_mention';
      
      // Create notification
      await supabase
        .from('notifications')
        .insert({
          type: notificationType,
          sender_id: senderId,
          receiver_id: user.id,
          post_id: postId,
          comment_id: commentId,
          message: `te ha mencionado en ${commentId ? 'un comentario' : 'una publicación'}`
        });
    }
  } catch (error) {
    console.error("Error processing mentions:", error);
  }
}

// Add the missing function for sending post notifications to friends
export async function sendNewPostNotifications(userId: string, postId: string) {
  try {
    // Get user's friends
    const { data: friends, error: friendsError } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', userId);
    
    if (friendsError) {
      console.error("Error fetching friends:", friendsError);
      return;
    }
    
    if (!friends || friends.length === 0) return; // No friends
    
    // Create notifications for each friend
    const notifications = friends.map(friend => ({
      type: 'new_post',
      sender_id: userId,
      receiver_id: friend.friend_id,
      post_id: postId,
      message: 'ha creado una nueva publicación'
    }));
    
    // Insert all notifications
    const { error: notifyError } = await supabase
      .from('notifications')
      .insert(notifications);
    
    if (notifyError) {
      console.error("Error sending notifications:", notifyError);
    }
  } catch (error) {
    console.error("Error in sendNewPostNotifications:", error);
  }
}
