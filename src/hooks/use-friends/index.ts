
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkMutualFollowing, unfollowUser, sendFriendRequest } from "@/lib/api/friends";

interface ProfileData {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

export interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
  mutual_friends_count?: number;
  status?: 'following' | 'follower' | 'friends';
}

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'accepted';
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
  const [following, setFollowing] = useState<Friend[]>([]);
  const [followers, setFollowers] = useState<Friend[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = async () => {
    if (!currentUserId) return;

    // Get all users the current user is following
    const { data: followingData, error: followingError } = await supabase
      .from('friendships')
      .select(`
        *,
        friend:profiles!friendships_friend_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('user_id', currentUserId)
      .eq('status', 'accepted');

    // Get all users who follow the current user
    const { data: followersData, error: followersError } = await supabase
      .from('friendships')
      .select(`
        *,
        user:profiles!friendships_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('friend_id', currentUserId)
      .eq('status', 'accepted');

    if (!followingError && !followersError && followingData && followersData) {
      const followingProfiles = followingData.map(f => ({
        friend_id: f.friend.id,
        friend_username: f.friend.username || '',
        friend_avatar_url: f.friend.avatar_url,
        status: 'following' as const
      }));
      
      const followersProfiles = followersData.map(f => ({
        friend_id: f.user.id,
        friend_username: f.user.username || '',
        friend_avatar_url: f.user.avatar_url,
        status: 'follower' as const
      }));
      
      setFollowing(followingProfiles);
      setFollowers(followersProfiles);
      
      // Friends are users who mutually follow each other
      const followingIds = new Set(followingProfiles.map(f => f.friend_id));
      const mutualFriends = followersProfiles.filter(f => followingIds.has(f.friend_id))
        .map(f => ({
          ...f,
          status: 'friends' as const
        }));
      
      setFriends(mutualFriends);
    }
  };

  const loadSuggestions = async () => {
    if (!currentUserId) return;

    // Get some user profiles that are not already being followed
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .neq('id', currentUserId)
      .limit(5);

    if (!error && data) {
      // Check which ones current user is not already following
      const followingIds = new Set(following.map(f => f.friend_id));
      
      // Filter out users that are already being followed
      const suggestions = data.filter(profile => !followingIds.has(profile.id))
        .map(s => ({
          id: s.id,
          username: s.username || '',
          avatar_url: s.avatar_url,
          mutual_friends_count: 0 // We could calculate this later if needed
        }));
      
      setSuggestions(suggestions);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      Promise.all([
        loadFriends(),
      ]).finally(() => {
        loadSuggestions();
        setLoading(false);
      });
    }
  }, [currentUserId]);

  const followUser = async (friendId: string) => {
    if (!currentUserId) return;

    try {
      await sendFriendRequest(friendId);
      await loadFriends();
      await loadSuggestions();
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const unfollowUserAction = async (friendId: string) => {
    if (!currentUserId) return;

    try {
      await unfollowUser(friendId);
      await loadFriends();
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  return {
    friends,          // Usuarios que siguen mutuamente (amigos)
    following,        // Usuarios que el usuario actual sigue
    followers,        // Usuarios que siguen al usuario actual
    suggestions,
    loading,
    followUser,       // Seguir a un usuario
    unfollowUser: unfollowUserAction,  // Dejar de seguir a un usuario
  };
}
