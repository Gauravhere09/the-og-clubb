
import { supabase } from "@/integrations/supabase/client";

export async function getFriends() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .neq('id', user.id);

    if (error) throw error;

    return profiles.map(profile => ({
      friend_id: profile.id,
      friend_username: profile.username || '',
      friend_avatar_url: profile.avatar_url
    }));

  } catch (error: any) {
    throw error;
  }
}

export async function checkFriendship(targetUserId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // For now, return null to indicate no friendship status
    return null;
  } catch (error: any) {
    return null;
  }
}

export async function sendFriendRequest(targetUserId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data: profile } = await supabase
      .from('profiles')
      .select()
      .eq('id', targetUserId)
      .single();

    if (!profile) throw new Error("Usuario no encontrado");

    return {
      sender_id: user.id,
      receiver_id: targetUserId,
      status: 'pending'
    };
  } catch (error: any) {
    throw error;
  }
}

export async function acceptFriendRequest(senderId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // For now, do nothing since we don't have the friendships table
    return;
  } catch (error: any) {
    throw error;
  }
}

export async function rejectFriendRequest(senderId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // For now, do nothing since we don't have the friendships table
    return;
  } catch (error: any) {
    throw error;
  }
}

export async function getFriendRequests() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // For now, return an empty array since we don't have the friendships table
    return [];
  } catch (error: any) {
    throw error;
  }
}
