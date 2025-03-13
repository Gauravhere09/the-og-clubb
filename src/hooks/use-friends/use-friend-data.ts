
import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  getFriends,
  getFollowers,
  getPendingFriendRequests,
  getSentFriendRequests,
  getFriendSuggestions
} from "@/lib/api/friends";
import { Friend, FriendRequest, FriendSuggestion } from "@/types/friends";
import { useToast } from "@/hooks/use-toast";

export function useFriendData(currentUserId: string | null) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [following, setFollowing] = useState<Friend[]>([]);
  const [followers, setFollowers] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Memoize connections based on friends and followers
  const mutualAndUniqueConnections = useMemo(() => {
    // Get set of follower IDs for quick lookup
    const followerIds = new Set(followers.map(f => f.friend_id));
    
    // Find mutual friends (I follow them, they follow me)
    const mutualFriends = friends.filter(f => followerIds.has(f.friend_id))
      .map(f => ({
        ...f,
        status: 'friends' as const
      }));
    
    // Users I follow who don't follow me back
    const onlyFollowing = friends.filter(f => !followerIds.has(f.friend_id))
      .map(f => ({
        ...f,
        status: 'following' as const
      }));
    
    // Users who follow me but I don't follow back
    const onlyFollowers = followers.filter(f => !friends.some(fr => fr.friend_id === f.friend_id))
      .map(f => ({
        ...f,
        status: 'follower' as const
      }));
    
    return {
      mutualFriends,
      onlyFollowing,
      onlyFollowers
    };
  }, [friends, followers]);

  // Load friends data
  const loadFriends = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setError(null);
      const [friendsData, followersData] = await Promise.all([
        getFriends(),
        getFollowers()
      ]);
      
      setFriends(friendsData);
      setFollowers(followersData);
      
      // Use the memoized connections (this will trigger after state updates)
    } catch (error: any) {
      console.error("Error loading friends:", error);
      setError(error?.message || "Error loading friends data");
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los amigos",
      });
    }
  }, [currentUserId, toast]);

  // Load friend requests
  const loadFriendRequests = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setError(null);
      const [requests, sent] = await Promise.all([
        getPendingFriendRequests(),
        getSentFriendRequests()
      ]);
      
      setPendingRequests(requests);
      setSentRequests(sent);
    } catch (error: any) {
      console.error("Error loading friend requests:", error);
      setError(error?.message || "Error loading friend requests");
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las solicitudes",
      });
    }
  }, [currentUserId, toast]);

  // Load suggestions
  const loadSuggestions = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setError(null);
      const suggestionsData = await getFriendSuggestions();
      setSuggestions(suggestionsData);
    } catch (error: any) {
      console.error("Error loading suggestions:", error);
      setError(error?.message || "Error loading suggestions");
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las sugerencias",
      });
    }
  }, [currentUserId, toast]);

  // Effect for initial data loading and subscription
  useEffect(() => {
    if (currentUserId) {
      setLoading(true);
      
      Promise.all([
        loadFriends(),
        loadFriendRequests(),
        loadSuggestions()
      ])
      .catch(error => {
        console.error("Error loading friend data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Hubo un problema cargando los datos",
        });
      })
      .finally(() => {
        setLoading(false);
      });

      // Subscribe to friendship changes for real-time updates
      const friendshipsChannel = supabase
        .channel('friendship_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'friendships',
        }, () => {
          // Reload data when changes occur
          loadFriends();
          loadFriendRequests();
          loadSuggestions();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(friendshipsChannel);
      };
    }
  }, [currentUserId, loadFriends, loadFriendRequests, loadSuggestions, toast]);

  // Update following whenever mutualAndUniqueConnections changes
  useEffect(() => {
    const { mutualFriends, onlyFollowing } = mutualAndUniqueConnections;
    setFollowing([...mutualFriends, ...onlyFollowing]);
  }, [mutualAndUniqueConnections]);

  return {
    friends: mutualAndUniqueConnections.mutualFriends,
    following,
    followers,
    pendingRequests,
    sentRequests,
    suggestions,
    loading,
    error,
    loadFriends,
    loadFriendRequests,
    loadSuggestions,
  };
}
