
import { supabase } from "@/integrations/supabase/client";
import { checkFriendship } from "./friendship-status";

export async function sendFriendRequest(targetUserId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const existingStatus = await checkFriendship(targetUserId);

    if (existingStatus === 'following' || existingStatus === 'friends' || existingStatus === 'pending') {
      return { status: existingStatus };
    }

    const { data, error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: targetUserId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Enviamos notificación al usuario
    await supabase
      .from('notifications')
      .insert({
        type: 'friend_request',
        sender_id: user.id,
        receiver_id: targetUserId,
        read: false
      });

    return { status: 'pending', data };
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

export async function acceptFriendRequest(requestId: string, senderId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Actualizamos la solicitud a 'accepted'
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) throw error;

    // Creamos la relación bidireccional
    const { error: error2 } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: senderId,
        status: 'accepted'
      });

    if (error2) throw error2;

    // Enviamos notificación al remitente
    await supabase
      .from('notifications')
      .insert({
        type: 'friend_accepted',
        sender_id: user.id,
        receiver_id: senderId,
        read: false
      });

    return true;
  } catch (error: any) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
}

export async function rejectFriendRequest(requestId: string) {
  try {
    // Eliminamos la solicitud
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
}

export async function cancelFriendRequest(requestId: string) {
  try {
    // Eliminamos la solicitud
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error canceling friend request:', error);
    throw error;
  }
}

export async function unfollowUser(targetUserId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('user_id', user.id)
      .eq('friend_id', targetUserId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}
