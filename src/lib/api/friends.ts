
import { supabase } from "@/integrations/supabase/client";

interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
}

export async function getFriends() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select(`
        friend:profiles!friendships_friend_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (friendshipsError) throw friendshipsError;

    return (friendships || []).map(friendship => ({
      friend_id: friendship.friend.id,
      friend_username: friendship.friend.username || '',
      friend_avatar_url: friendship.friend.avatar_url
    }));

  } catch (error: any) {
    console.error('Error getting friends:', error);
    throw error;
  }
}

export async function checkFriendship(targetUserId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data, error } = await supabase
      .from('friendships')
      .select('status')
      .or(`user_id.eq.${user.id}.and.friend_id.eq.${targetUserId},user_id.eq.${targetUserId}.and.friend_id.eq.${user.id}`)
      .maybeSingle();

    if (error) throw error;
    return data?.status || null;
  } catch (error: any) {
    console.error('Error checking friendship:', error);
    return null;
  }
}

export async function sendFriendRequest(targetUserId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

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
    return data;
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

export async function getFriendRequests() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        sender:profiles!friendships_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (error) throw error;

    return (data || []).map(request => ({
      id: request.id,
      user_id: request.user_id,
      friend_id: request.friend_id,
      status: request.status,
      created_at: request.created_at,
      user: {
        username: request.sender.username || '',
        avatar_url: request.sender.avatar_url
      }
    }));
  } catch (error: any) {
    console.error('Error getting friend requests:', error);
    throw error;
  }
}

export async function respondToFriendRequest(requestId: string, accept: boolean) {
  try {
    const { error } = await supabase
      .from('friendships')
      .update({
        status: accept ? 'accepted' : 'rejected'
      })
      .eq('id', requestId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error responding to friend request:', error);
    throw error;
  }
}
