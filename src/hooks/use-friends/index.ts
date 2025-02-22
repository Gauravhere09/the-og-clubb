
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/types/database";

export interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
  mutual_friends_count?: number;
  status?: 'pending' | 'accepted' | 'rejected';
}

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

export interface FriendSuggestion {
  id: string;
  username: string;
  avatar_url: string | null;
  mutual_friends_count: number;
}

export function useFriends(currentUserId: string | null) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = async () => {
    if (!currentUserId) return;

    const { data: friendships, error } = await supabase
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

    if (!error && friendships) {
      const processedFriends = friendships.map(f => ({
        friend_id: f.friend?.id || '',
        friend_username: f.friend?.username || '',
        friend_avatar_url: f.friend?.avatar_url,
        status: 'accepted' as const
      }));
      setFriends(processedFriends);
    }
  };

  const loadRequests = async () => {
    if (!currentUserId) return;

    const { data, error } = await supabase
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

    if (!error && data) {
      const processedRequests = data.map(request => ({
        id: request.id,
        user_id: request.user_id,
        friend_id: request.friend_id,
        status: request.status as 'pending',
        created_at: request.created_at,
        user: {
          username: request.user?.username || '',
          avatar_url: request.user?.avatar_url
        }
      }));
      setFriendRequests(processedRequests);
    }
  };

  const loadSuggestions = async () => {
    if (!currentUserId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .neq('id', currentUserId)
      .limit(5);

    if (!error && data) {
      const processedSuggestions = data.map(s => ({
        id: s.id,
        username: s.username || '',
        avatar_url: s.avatar_url,
        mutual_friends_count: 0 // This would need to be calculated
      }));
      setSuggestions(processedSuggestions);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!currentUserId) return;

    await supabase
      .from('friendships')
      .insert({
        user_id: currentUserId,
        friend_id: friendId,
        status: 'pending'
      });

    await loadSuggestions();
  };

  const respondToFriendRequest = async (requestId: string, accept: boolean) => {
    await supabase
      .from('friendships')
      .update({
        status: accept ? 'accepted' : 'rejected'
      })
      .eq('id', requestId);

    await loadRequests();
    if (accept) await loadFriends();
  };

  useEffect(() => {
    if (currentUserId) {
      Promise.all([
        loadFriends(),
        loadRequests(),
        loadSuggestions()
      ]).finally(() => setLoading(false));
    }
  }, [currentUserId]);

  return {
    friends,
    friendRequests,
    suggestions,
    loading,
    sendFriendRequest,
    respondToFriendRequest
  };
}
