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

    // Obtenemos usuarios que el usuario actual ha aceptado como amigos
    const { data: acceptedFriends, error: followingError } = await supabase
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

    if (followingError) throw followingError;

    // Convertimos el resultado a nuestro formato Friend
    const friendsArray = (acceptedFriends || []).map(f => ({
      friend_id: f.friend.id,
      friend_username: f.friend.username || '',
      friend_avatar_url: f.friend.avatar_url
    }));

    return friendsArray;
  } catch (error: any) {
    console.error('Error getting friends:', error);
    throw error;
  }
}

export async function getFollowers() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Obtenemos usuarios que siguen al usuario actual
    const { data: followers, error: followersError } = await supabase
      .from('friendships')
      .select(`
        user:profiles!friendships_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('friend_id', user.id)
      .eq('status', 'accepted');

    if (followersError) throw followersError;

    // Convertimos el resultado a nuestro formato Friend
    const followersArray = (followers || []).map(f => ({
      friend_id: f.user.id,
      friend_username: f.user.username || '',
      friend_avatar_url: f.user.avatar_url
    }));

    return followersArray;
  } catch (error: any) {
    console.error('Error getting followers:', error);
    throw error;
  }
}

export async function getPendingFriendRequests() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Obtenemos solicitudes pendientes enviadas al usuario actual
    const { data: pendingRequests, error } = await supabase
      .from('friendships')
      .select(`
        id,
        user:profiles!friendships_user_id_fkey (
          id,
          username,
          avatar_url
        ),
        created_at
      `)
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (error) throw error;

    // Convertimos el resultado al formato FriendRequest
    const requestsArray = (pendingRequests || []).map(request => ({
      id: request.id,
      user_id: request.user.id,
      friend_id: user.id,
      status: 'pending' as const,
      created_at: request.created_at,
      user: {
        username: request.user.username || '',
        avatar_url: request.user.avatar_url
      }
    }));

    return requestsArray;
  } catch (error: any) {
    console.error('Error getting friend requests:', error);
    throw error;
  }
}

export async function getSentFriendRequests() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Obtenemos solicitudes pendientes enviadas por el usuario actual
    const { data: sentRequests, error } = await supabase
      .from('friendships')
      .select(`
        id,
        friend:profiles!friendships_friend_id_fkey (
          id,
          username,
          avatar_url
        ),
        created_at
      `)
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (error) throw error;

    // Convertimos el resultado al formato FriendRequest
    const requestsArray = (sentRequests || []).map(request => ({
      id: request.id,
      user_id: user.id,
      friend_id: request.friend.id,
      status: 'pending' as const,
      created_at: request.created_at,
      user: {
        username: request.friend.username || '',
        avatar_url: request.friend.avatar_url
      }
    }));

    return requestsArray;
  } catch (error: any) {
    console.error('Error getting sent friend requests:', error);
    throw error;
  }
}

export async function checkFriendship(targetUserId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data: userFollowsTarget, error: error1 } = await supabase
      .from('friendships')
      .select('status')
      .eq('user_id', user.id)
      .eq('friend_id', targetUserId)
      .single();

    const { data: targetFollowsUser, error: error2 } = await supabase
      .from('friendships')
      .select('status')
      .eq('user_id', targetUserId)
      .eq('friend_id', user.id)
      .single();

    if (userFollowsTarget?.status === 'accepted' && targetFollowsUser?.status === 'accepted') {
      return 'friends';
    } else if (userFollowsTarget?.status === 'accepted') {
      return 'following';
    } else if (userFollowsTarget?.status === 'pending') {
      return 'pending';
    } else if (targetFollowsUser?.status === 'pending') {
      return 'request_received';
    } else if (targetFollowsUser?.status === 'accepted') {
      return 'follower';
    } else {
      return null;
    }
  } catch (error: any) {
    console.error('Error checking friendship:', error);
    return null;
  }
}

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

export async function getFriendSuggestions() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Obtenemos los IDs de los usuarios que ya son amigos o tienen solicitudes pendientes
    const { data: existingConnections } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id);

    const excludeIds = [
      user.id,
      ...(existingConnections || []).map(c => c.friend_id)
    ].filter(Boolean);

    // Obtenemos sugerencias de usuarios que no son amigos ni tienen solicitudes pendientes
    const { data: suggestions, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(10);

    if (error) throw error;

    // Transformamos los resultados a nuestro formato FriendSuggestion
    const sugestionsWithMutualFriends = await Promise.all((suggestions || []).map(async (sugg) => {
      // Aquí podríamos implementar la lógica para detectar amigos en común
      // Por simplicidad, usamos un número aleatorio entre 0 y 5
      const mutual_friends_count = Math.floor(Math.random() * 6);
      
      return {
        id: sugg.id,
        username: sugg.username || '',
        avatar_url: sugg.avatar_url,
        mutual_friends_count
      };
    }));

    return sugestionsWithMutualFriends;
  } catch (error: any) {
    console.error('Error getting friend suggestions:', error);
    return [];
  }
}
