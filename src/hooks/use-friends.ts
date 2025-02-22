
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
  mutual_friends_count?: number;
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
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUserId) return;
    loadFriendsAndRequests();
    loadSuggestions();

    const subscription = supabase
      .channel('friendships_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'friendships' }, 
        () => {
          loadFriendsAndRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId]);

  const loadFriendsAndRequests = async () => {
    try {
      if (!currentUserId) return;

      // Cargar amigos
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:profiles!friendships_friend_id_fkey(
            id,
            username,
            avatar_url
          )
        `)
        .eq('user_id', currentUserId)
        .eq('status', 'accepted');

      if (friendshipsError) throw friendshipsError;

      // Cargar solicitudes pendientes
      const { data: requests, error: requestsError } = await supabase
        .from('friendships')
        .select(`
          *,
          sender:profiles!friendships_user_id_fkey(
            username,
            avatar_url
          )
        `)
        .eq('friend_id', currentUserId)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      setFriends(friendships?.map(f => ({
        friend_id: f.friend.id,
        friend_username: f.friend.username || '',
        friend_avatar_url: f.friend.avatar_url
      })) || []);

      setFriendRequests(requests?.map(r => ({
        id: r.id,
        user_id: r.user_id,
        friend_id: r.friend_id,
        status: r.status as 'pending',
        created_at: r.created_at,
        user: {
          username: r.sender.username || '',
          avatar_url: r.sender.avatar_url
        }
      })) || []);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los amigos",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      if (!currentUserId) return;

      // Por ahora, simplemente cargamos usuarios que no son amigos
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .neq('id', currentUserId)
        .limit(5);

      if (suggestionsError) throw suggestionsError;

      setSuggestions(suggestions.map(s => ({
        id: s.id,
        username: s.username || '',
        avatar_url: s.avatar_url,
        mutual_friends_count: Math.floor(Math.random() * 5) // Simulado por ahora
      })));
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      if (!currentUserId) throw new Error("No autenticado");

      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: currentUserId,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Solicitud enviada",
        description: "La solicitud de amistad ha sido enviada",
      });

      await loadSuggestions();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la solicitud de amistad",
      });
    }
  };

  const respondToFriendRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({
          status: accept ? 'accepted' : 'rejected'
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: accept ? "Solicitud aceptada" : "Solicitud rechazada",
        description: accept 
          ? "Ahora son amigos" 
          : "Has rechazado la solicitud de amistad",
      });

      await loadFriendsAndRequests();
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la solicitud",
      });
    }
  };

  return {
    friends,
    friendRequests,
    suggestions,
    loading,
    sendFriendRequest,
    respondToFriendRequest
  };
}
