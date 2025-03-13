
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  getFriends,
  getFollowers,
  getPendingFriendRequests,
  getSentFriendRequests,
  getFriendSuggestions
} from "@/lib/api/friends";
import { Friend, FriendRequest, FriendSuggestion } from "./types";

export function useFriendData(currentUserId: string | null) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [following, setFollowing] = useState<Friend[]>([]);
  const [followers, setFollowers] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = async () => {
    if (!currentUserId) return;

    try {
      const friendsData = await getFriends();
      const followersData = await getFollowers();
      
      // Identificamos amigos mutuos
      const followerIds = new Set(followersData.map(f => f.friend_id));
      const mutualFriends = friendsData.filter(f => followerIds.has(f.friend_id))
        .map(f => ({
          ...f,
          status: 'friends' as const
        }));
      
      // Usuarios que sigo pero no me siguen
      const onlyFollowing = friendsData.filter(f => !followerIds.has(f.friend_id))
        .map(f => ({
          ...f,
          status: 'following' as const
        }));
      
      // Usuarios que me siguen pero no sigo
      const onlyFollowers = followersData.filter(f => !friendsData.some(fr => fr.friend_id === f.friend_id))
        .map(f => ({
          ...f,
          status: 'follower' as const
        }));
      
      setFriends(mutualFriends);
      setFollowing([...mutualFriends, ...onlyFollowing]);
      setFollowers([...mutualFriends, ...onlyFollowers]);
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  };

  const loadFriendRequests = async () => {
    if (!currentUserId) return;

    try {
      const requests = await getPendingFriendRequests();
      setPendingRequests(requests);
      
      const sent = await getSentFriendRequests();
      setSentRequests(sent);
    } catch (error) {
      console.error("Error loading friend requests:", error);
    }
  };

  const loadSuggestions = async () => {
    if (!currentUserId) return;

    try {
      const suggestionsData = await getFriendSuggestions();
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error("Error loading suggestions:", error);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      setLoading(true);
      Promise.all([
        loadFriends(),
        loadFriendRequests(),
        loadSuggestions()
      ]).finally(() => {
        setLoading(false);
      });

      // Suscribirse a cambios en 'friendships'
      const friendshipsChannel = supabase
        .channel('friendship_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'friendships',
        }, () => {
          // Recargamos los datos cuando hay cambios
          loadFriends();
          loadFriendRequests();
          loadSuggestions();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(friendshipsChannel);
      };
    }
  }, [currentUserId]);

  return {
    friends,
    following,
    followers,
    pendingRequests,
    sentRequests,
    suggestions,
    loading,
    loadFriends,
    loadFriendRequests,
    loadSuggestions,
  };
}
