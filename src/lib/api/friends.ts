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

    const { data: following, error: followingError } = await supabase
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

    const followingIds = (following || []).map(f => f.friend.id);
    const friendsArray = (followers || []).filter(f => followingIds.includes(f.user.id))
      .map(f => ({
        friend_id: f.user.id,
        friend_username: f.user.username || '',
        friend_avatar_url: f.user.avatar_url
      }));

    return friendsArray;

  } catch (error: any) {
    console.error('Error getting friends:', error);
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

    if (existingStatus === 'following' || existingStatus === 'friends') {
      return { status: existingStatus };
    }

    const { data, error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: targetUserId,
        status: 'accepted'
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
  return [];
}

export async function respondToFriendRequest(requestId: string, accept: boolean) {
  return;
}

export async function checkMutualFollowing(targetUserId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: userFollowsTarget, error: error1 } = await supabase
      .from('friendships')
      .select()
      .eq('user_id', user.id)
      .eq('friend_id', targetUserId)
      .eq('status', 'accepted')
      .single();

    const { data: targetFollowsUser, error: error2 } = await supabase
      .from('friendships')
      .select()
      .eq('user_id', targetUserId)
      .eq('friend_id', user.id)
      .eq('status', 'accepted')
      .single();

    return !!userFollowsTarget && !!targetFollowsUser;
  } catch (error) {
    console.error('Error checking mutual following:', error);
    return false;
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
