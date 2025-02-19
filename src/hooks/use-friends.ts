
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/database.types";
import { useToast } from "@/hooks/use-toast";

export interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
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

type Tables = Database['public']['Tables'];
type Friendship = Tables['friendships']['Row'];
type Profile = Tables['profiles']['Row'];

export function useFriends(currentUserId: string | null) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUserId) return;
    
    const loadFriends = async () => {
      try {
        const { data: friendships, error: friendshipsError } = await supabase
          .from('friendships')
          .select(`
            *,
            user:user_id(username, avatar_url)
          `)
          .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
          .eq('status', 'accepted');

        if (friendshipsError) throw friendshipsError;

        const { data: pendingRequests, error: requestsError } = await supabase
          .from('friendships')
          .select(`
            *,
            user:user_id(username, avatar_url)
          `)
          .eq('friend_id', currentUserId)
          .eq('status', 'pending');

        if (requestsError) throw requestsError;

        if (friendships) {
          const friendIds = friendships.map(friendship => 
            friendship.user_id === currentUserId ? friendship.friend_id : friendship.user_id
          );

          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', friendIds);

          if (profilesError) throw profilesError;

          if (profiles) {
            const friendsList = profiles.map(profile => ({
              friend_id: profile.id,
              friend_username: profile.username || '',
              friend_avatar_url: profile.avatar_url
            }));
            setFriends(friendsList);
          }
        }

        if (pendingRequests) {
          setFriendRequests(pendingRequests as FriendRequest[]);
        }
      } catch (error) {
        console.error('Error loading friends:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los amigos",
        });
      }
    };

    loadFriends();

    const subscription = supabase
      .channel('friendships')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships'
      }, () => {
        loadFriends();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId]);

  const sendFriendRequest = async (friendId: string) => {
    if (!currentUserId) return;

    try {
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
        description: accept ? "Ahora son amigos" : "Has rechazado la solicitud de amistad",
      });
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
    sendFriendRequest,
    respondToFriendRequest
  };
}
