
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  checkFriendship, 
  unfollowUser, 
  sendFriendRequest, 
  getFriends,
  getFollowers,
  getPendingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendSuggestions
} from "@/lib/api/friends";
import { useToast } from "@/hooks/use-toast";

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
  status: 'accepted' | 'pending' | 'rejected';
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
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const followUser = async (friendId: string) => {
    if (!currentUserId) return;

    try {
      await sendFriendRequest(friendId);
      toast({
        title: "Solicitud enviada",
        description: "Has enviado una solicitud de amistad"
      });
      await loadFriends();
      await loadSuggestions();
    } catch (error) {
      console.error("Error following user:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud",
        variant: "destructive"
      });
    }
  };

  const unfollowUserAction = async (friendId: string) => {
    if (!currentUserId) return;

    try {
      await unfollowUser(friendId);
      toast({
        title: "Dejaste de seguir",
        description: "Has dejado de seguir a este usuario"
      });
      await loadFriends();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast({
        title: "Error",
        description: "No se pudo dejar de seguir al usuario",
        variant: "destructive"
      });
    }
  };

  const handleFriendRequest = async (requestId: string, senderId: string, accept: boolean) => {
    try {
      if (accept) {
        await acceptFriendRequest(requestId, senderId);
        toast({
          title: "Solicitud aceptada",
          description: "Ahora son amigos"
        });
      } else {
        await rejectFriendRequest(requestId);
        toast({
          title: "Solicitud rechazada",
          description: "Has rechazado la solicitud de amistad"
        });
      }
      
      // Actualizamos los datos
      await loadFriendRequests();
      await loadFriends();
      await loadSuggestions();
    } catch (error) {
      console.error("Error handling friend request:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud",
        variant: "destructive"
      });
    }
  };

  const dismissSuggestion = async (userId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== userId));
  };

  return {
    friends,         // Usuarios que siguen mutuamente (amigos)
    following,       // Usuarios que el usuario actual sigue
    followers,       // Usuarios que siguen al usuario actual
    pendingRequests, // Solicitudes de amistad pendientes
    suggestions,     // Sugerencias de amistad
    loading,
    followUser,      // Enviar solicitud de amistad
    unfollowUser: unfollowUserAction, // Dejar de seguir
    handleFriendRequest, // Aceptar/rechazar solicitud
    dismissSuggestion, // Descartar sugerencia
  };
}
