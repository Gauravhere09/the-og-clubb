
import { supabase } from "@/integrations/supabase/client";
import type { Friend, FriendRequest, FriendSuggestion } from "@/types/friends";
import type { Tables } from "@/types/database";

interface FriendshipWithProfile {
  id: string;
  friend: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

interface FriendRequestWithProfile {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  user: {
    username: string | null;
    avatar_url: string | null;
  };
}

export async function getFriendsData(userId: string) {
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
    .eq('user_id', userId)
    .eq('status', 'accepted')
    .returns<FriendshipWithProfile[]>();

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
    .eq('friend_id', userId)
    .eq('status', 'pending')
    .returns<FriendRequestWithProfile[]>();

  if (friendshipsError) throw friendshipsError;
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

export async function getFriendSuggestions(userId: string): Promise<FriendSuggestion[]> {
  const { data: suggestions, error: suggestionsError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .neq('id', userId)
    .limit(5);

  if (suggestionsError) throw suggestionsError;

  return (suggestions || []).map(s => ({
    id: s.id,
    username: s.username || '',
    avatar_url: s.avatar_url,
    mutual_friends_count: 0 // This would need to be calculated
  }));
}

