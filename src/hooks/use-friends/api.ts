
import { supabase } from "@/integrations/supabase/client";
import type { Friend, FriendRequest, FriendSuggestion } from "@/types/friends";
import type { Tables } from "@/types/database";

export async function loadFriendsAndRequests(currentUserId: string) {
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select(`
      id,
      friend:profiles!friendships_friend_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .eq('user_id', currentUserId)
    .eq('status', 'accepted');

  if (friendshipsError) throw friendshipsError;

  const { data: requests, error: requestsError } = await supabase
    .from('friendships')
    .select(`
      id,
      user_id,
      friend_id,
      status,
      created_at,
      user:profiles!friendships_user_id_fkey (
        username,
        avatar_url
      )
    `)
    .eq('friend_id', currentUserId)
    .eq('status', 'pending');

  if (requestsError) throw requestsError;

  const friends: Friend[] = (friendships || []).map(f => ({
    friend_id: f.friend.id,
    friend_username: f.friend.username || '',
    friend_avatar_url: f.friend.avatar_url
  }));

  const friendRequests: FriendRequest[] = (requests || []).map(r => ({
    id: r.id,
    user_id: r.user_id,
    friend_id: r.friend_id,
    status: 'pending',
    created_at: r.created_at,
    user: {
      username: r.user.username || '',
      avatar_url: r.user.avatar_url || null
    }
  }));

  return { friends, friendRequests };
}

export async function loadSuggestions(currentUserId: string): Promise<FriendSuggestion[]> {
  const { data: suggestions, error: suggestionsError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .neq('id', currentUserId)
    .limit(5);

  if (suggestionsError) throw suggestionsError;

  return (suggestions || []).map(s => ({
    id: s.id,
    username: s.username || '',
    avatar_url: s.avatar_url,
    mutual_friends_count: 0 // This would need to be calculated
  }));
}

export async function sendFriendRequest(currentUserId: string, friendId: string) {
  const { error } = await supabase
    .from('friendships')
    .insert({
      user_id: currentUserId,
      friend_id: friendId,
      status: 'pending'
    });

  if (error) throw error;
}

export async function respondToFriendRequest(requestId: string, accept: boolean) {
  const { error } = await supabase
    .from('friendships')
    .update({
      status: accept ? 'accepted' : 'rejected'
    })
    .eq('id', requestId);

  if (error) throw error;
}
