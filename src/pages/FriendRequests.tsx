
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FriendRequestsLoader } from "@/components/friends/FriendRequestsLoader";
import { FriendRequestsList } from "@/components/friends/FriendRequestsList";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FriendSuggestionsList } from "@/components/friends/FriendSuggestionsList";
import { AllFriendsList } from "@/components/friends/AllFriendsList";

interface FriendRequestData {
  id: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  created_at: string;
  mutual_friends_count?: number;
}

interface SentRequestData {
  id: string;
  friend: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  status: string;
  created_at: string;
}

interface FriendSuggestion {
  id: string;
  username: string;
  avatar_url: string | null;
  mutual_friends_count?: number;
}

export default function FriendRequests() {
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestData[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequestData[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'suggestions' | 'friends'>('requests');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadRequests();
    loadSuggestions();
    loadFriends();

    const subscription = supabase
      .channel('friendships')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships'
      }, () => {
        loadRequests();
        loadFriends();
        loadSuggestions();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: received, error: receivedError } = await supabase
        .from('friendships')
        .select(`
          id,
          created_at,
          user:profiles!friendships_user_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (receivedError) throw receivedError;

      const { data: sent, error: sentError } = await supabase
        .from('friendships')
        .select(`
          id,
          created_at,
          friend:profiles!friendships_friend_id_fkey (
            id,
            username,
            avatar_url
          ),
          status
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (sentError) throw sentError;

      if (received) {
        // Simulate mutual friends for now
        const processedReceived: FriendRequestData[] = received.map(request => {
          const randomMutualFriends = Math.floor(Math.random() * 5);
          return {
            id: request.id,
            created_at: request.created_at,
            sender: {
              id: request.user?.id || '',
              username: request.user?.username || '',
              avatar_url: request.user?.avatar_url
            },
            mutual_friends_count: randomMutualFriends > 0 ? randomMutualFriends : undefined
          };
        });
        setReceivedRequests(processedReceived);
      }

      if (sent) {
        setSentRequests(sent);
      }
    } catch (error) {
      console.error('Error loading friend requests:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las solicitudes",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Simulate suggestions for demo purposes
      const demoSuggestions = [
        {id: '1', username: 'Miguel Ángel', avatar_url: null, mutual_friends_count: 2},
        {id: '2', username: 'Carla Pérez', avatar_url: null, mutual_friends_count: 1},
        {id: '3', username: 'Juan Rodriguez', avatar_url: null, mutual_friends_count: 3},
        {id: '4', username: 'Ana García', avatar_url: null}
      ];
      
      setSuggestions(demoSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const loadFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          friend:profiles!friendships_friend_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;

      if (data) {
        setFriends(data.map(item => item.friend));
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleRequest = async (requestId: string, accept: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: requestData, error: requestError } = await supabase
        .from('friendships')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', requestId)
        .select('user_id')
        .single();

      if (requestError) throw requestError;

      if (accept && requestData) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            type: 'friend_accepted',
            sender_id: user.id,
            receiver_id: requestData.user_id
          });

        if (notificationError) throw notificationError;
      }

      toast({
        title: accept ? "Solicitud aceptada" : "Solicitud rechazada",
        description: accept 
          ? "Ahora son amigos" 
          : "Has rechazado la solicitud de amistad",
      });

      await loadRequests();
      await loadFriends();
    } catch (error) {
      console.error('Error handling request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la solicitud",
      });
    }
  };

  const handleSendRequest = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          type: 'friend_request',
          sender_id: user.id,
          receiver_id: friendId
        });

      if (notifError) throw notifError;

      toast({
        title: "Solicitud enviada",
        description: "La solicitud de amistad ha sido enviada",
      });

      // Refresh data
      loadSuggestions();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la solicitud de amistad",
      });
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Solicitud cancelada",
        description: "La solicitud de amistad ha sido cancelada",
      });

      await loadRequests();
    } catch (error) {
      console.error('Error canceling request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cancelar la solicitud",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-muted/30">
        <Navigation />
        <FriendRequestsLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Amigos</h1>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="p-4 flex gap-3">
          <Button 
            variant={activeTab === 'suggestions' ? "default" : "outline"} 
            onClick={() => setActiveTab('suggestions')}
            className="rounded-full flex-1 md:flex-none"
          >
            Sugerencias
          </Button>
          <Button 
            variant={activeTab === 'friends' ? "default" : "outline"} 
            onClick={() => setActiveTab('friends')}
            className="rounded-full flex-1 md:flex-none"
          >
            Tus amigos
          </Button>
        </div>

        <div className="p-4">
          {activeTab === 'requests' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Solicitudes de amistad</h2>
                {receivedRequests.length > 0 && (
                  <Link to="#" className="text-primary">Ver todo</Link>
                )}
              </div>
              <FriendRequestsList 
                requests={receivedRequests.map(request => ({
                  id: request.id,
                  user_id: request.sender.id,
                  friend_id: '',
                  status: 'pending',
                  created_at: request.created_at,
                  user: {
                    username: request.sender.username,
                    avatar_url: request.sender.avatar_url
                  },
                  mutual_friends_count: request.mutual_friends_count
                }))} 
                onRespond={handleRequest}
              />
            </>
          )}

          {activeTab === 'suggestions' && (
            <FriendSuggestionsList
              suggestions={suggestions}
              onSendRequest={handleSendRequest}
            />
          )}

          {activeTab === 'friends' && (
            <AllFriendsList friends={friends} />
          )}
        </div>
      </main>
    </div>
  );
}
