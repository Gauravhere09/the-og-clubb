
import { supabase } from "@/integrations/supabase/client";
import type { Friend, FriendRequest, FriendSuggestion } from "@/types/friends";

export async function loadFriendsAndRequests(currentUserId: string) {
  // Load friends using the friends table
  const { data: friendsData, error: friendsError } = await supabase
    .from('friends')
    .select(`
      id,
      friend_id,
      profiles!friends_friend_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .eq('user_id', currentUserId);

  if (friendsError) throw friendsError;

  // Load pending friend requests
  const { data: requests, error: requestsError } = await supabase
    .from('friend_requests')
    .select(`
      id,
      sender_id,
      receiver_id,
      status,
      created_at,
      profiles!friend_requests_sender_id_fkey (
        username,
        avatar_url
      )
    `)
    .eq('receiver_id', currentUserId)
    .eq('status', 'pending');

  if (requestsError) throw requestsError;

  const friends: Friend[] = friendsData?.map(f => ({
    friend_id: f.friend_id,
    friend_username: f.profiles?.username || '',
    friend_avatar_url: f.profiles?.avatar_url
  })) || [];

  const friendRequests: FriendRequest[] = requests?.map(r => ({
    id: r.id,
    user_id: r.sender_id,
    friend_id: r.receiver_id,
    status: r.status as 'pending',
    created_at: r.created_at,
    user: {
      username: r.profiles?.username || '',
      avatar_url: r.profiles?.avatar_url
    }
  })) || [];

  return { friends, friendRequests };
}

export async function loadSuggestions(currentUserId: string): Promise<FriendSuggestion[]> {
  const { data: suggestions, error: suggestionsError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .neq('id', currentUserId)
    .limit(5);

  if (suggestionsError) throw suggestionsError;

  return suggestions.map(s => ({
    id: s.id,
    username: s.username || '',
    avatar_url: s.avatar_url,
    mutual_friends_count: Math.floor(Math.random() * 5) // Simulated for now
  }));
}

export async function sendFriendRequest(currentUserId: string, friendId: string) {
  const { error } = await supabase
    .from('friend_requests')
    .insert({
      sender_id: currentUserId,
      receiver_id: friendId,
      status: 'pending'
    });

  if (error) throw error;
}

export async function respondToFriendRequest(requestId: string, accept: boolean) {
  if (accept) {
    // First get the request details
    const { data: request, error: requestError } = await supabase
      .from('friend_requests')
      .select('sender_id, receiver_id')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;

    // Create the friendship record
    const { error: friendError } = await supabase
      .from('friends')
      .insert({
        user_id: request.receiver_id,
        friend_id: request.sender_id
      });

    if (friendError) throw friendError;
  }

  // Update the request status
  const { error } = await supabase
    .from('friend_requests')
    .update({
      status: accept ? 'accepted' : 'rejected'
    })
    .eq('id', requestId);

  if (error) throw error;
}
