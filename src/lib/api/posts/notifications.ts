
import { supabase } from "@/integrations/supabase/client";

// Función para enviar notificaciones a amigos sobre nueva publicación
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

// Nueva función para enviar notificaciones de menciones
export async function sendMentionNotifications(
  contentText: string, 
  postId: string | null = null,
  commentId: string | null = null,
  senderId: string
) {
  try {
    // Expresión regular para detectar menciones
    const mentionRegex = /@(\w+)/g;
    let match;
    const mentionedUsernames = [];
    
    // Extraer todos los nombres de usuario mencionados
    while ((match = mentionRegex.exec(contentText)) !== null) {
      mentionedUsernames.push(match[1]);
    }
    
    if (mentionedUsernames.length === 0) return;
    
    // Buscar IDs de los usuarios mencionados
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, username')
      .in('username', mentionedUsernames);
    
    if (error || !users || users.length === 0) return;
    
    // Generar notificaciones para cada usuario mencionado
    const notifications = users
      .filter(user => user.id !== senderId) // No notificar al propio autor
      .map(user => ({
        type: 'mention',
        sender_id: senderId,
        receiver_id: user.id,
        post_id: postId,
        comment_id: commentId,
        message: `te ha mencionado en una ${postId ? 'publicación' : 'comentario'}`,
        read: false
      }));
    
    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }
  } catch (error) {
    console.error('Error sending mention notifications:', error);
  }
}
