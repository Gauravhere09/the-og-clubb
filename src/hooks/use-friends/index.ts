
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Friend, FriendRequest, FriendSuggestion } from "@/types/friends";
import { loadFriendsAndRequests, loadSuggestions, sendFriendRequest, respondToFriendRequest } from "./api";

export function useFriends(currentUserId: string | null) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleLoadFriendsAndRequests = async () => {
    try {
      if (!currentUserId) return;
      const { friends: loadedFriends, friendRequests: loadedRequests } = await loadFriendsAndRequests(currentUserId);
      setFriends(loadedFriends);
      setFriendRequests(loadedRequests);
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

  const handleLoadSuggestions = async () => {
    try {
      if (!currentUserId) return;
      const loadedSuggestions = await loadSuggestions(currentUserId);
      setSuggestions(loadedSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;
    handleLoadFriendsAndRequests();
    handleLoadSuggestions();

    const subscription = supabase
      .channel('friendships_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'friendships' }, 
        () => {
          handleLoadFriendsAndRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId]);

  const handleSendFriendRequest = async (friendId: string) => {
    try {
      if (!currentUserId) throw new Error("No autenticado");
      await sendFriendRequest(currentUserId, friendId);
      toast({
        title: "Solicitud enviada",
        description: "La solicitud de amistad ha sido enviada",
      });
      await handleLoadSuggestions();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la solicitud de amistad",
      });
    }
  };

  const handleRespondToFriendRequest = async (requestId: string, accept: boolean) => {
    try {
      await respondToFriendRequest(requestId, accept);
      toast({
        title: accept ? "Solicitud aceptada" : "Solicitud rechazada",
        description: accept 
          ? "Ahora son amigos" 
          : "Has rechazado la solicitud de amistad",
      });
      await handleLoadFriendsAndRequests();
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
    sendFriendRequest: handleSendFriendRequest,
    respondToFriendRequest: handleRespondToFriendRequest
  };
}

export type { Friend, FriendRequest, FriendSuggestion };
