
import { useState, useEffect, useMemo } from "react";
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
  const { toast } = useToast();

  // Memoizar los amigos mutuos y únicos
  const mutualAndUniqueConnections = useMemo(() => {
    // Crear un conjunto con los IDs de seguidores
    const followerIds = new Set(followers.map(f => f.friend_id));
    
    // Identificar amigos mutuos
    const mutualFriends = friends.filter(f => followerIds.has(f.friend_id))
      .map(f => ({
        ...f,
        status: 'friends' as const
      }));
    
    // Identificar usuarios que solo sigo
    const onlyFollowing = friends.filter(f => !followerIds.has(f.friend_id))
      .map(f => ({
        ...f,
        status: 'following' as const
      }));
    
    // Identificar usuarios que solo me siguen
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

  const loadFriends = async () => {
    if (!currentUserId) return;

    try {
      const [friendsData, followersData] = await Promise.all([
        getFriends(),
        getFollowers()
      ]);
      
      setFriends(friendsData);
      setFollowers(followersData);
      
      // Usar los datos memorizados
      const { mutualFriends, onlyFollowing, onlyFollowers } = mutualAndUniqueConnections;
      
      setFollowing([...mutualFriends, ...onlyFollowing]);
    } catch (error) {
      console.error("Error loading friends:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los amigos",
      });
    }
  };

  const loadFriendRequests = async () => {
    if (!currentUserId) return;

    try {
      const [requests, sent] = await Promise.all([
        getPendingFriendRequests(),
        getSentFriendRequests()
      ]);
      
      setPendingRequests(requests);
      setSentRequests(sent);
    } catch (error) {
      console.error("Error loading friend requests:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las solicitudes",
      });
    }
  };

  const loadSuggestions = async () => {
    if (!currentUserId) return;

    try {
      const suggestionsData = await getFriendSuggestions();
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error("Error loading suggestions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las sugerencias",
      });
    }
  };

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
    friends: mutualAndUniqueConnections.mutualFriends,
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
