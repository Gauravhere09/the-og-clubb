
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FriendRequestsHeader } from "@/components/friends/FriendRequestsHeader";
import { FriendTabSelector } from "@/components/friends/FriendTabSelector";
import { RequestsSection } from "@/components/friends/RequestsSection";
import { SuggestionsSection } from "@/components/friends/SuggestionsSection";
import { FriendsListSection } from "@/components/friends/FriendsListSection";

interface FriendRequestData {
  id: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  mutual_friends?: {
    username: string;
    avatar_url: string | null;
  }[];
}

interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  mutual_friends_count?: number;
}

interface Suggestion {
  id: string;
  username: string;
  avatar_url: string | null;
  mutual_friends?: {
    username: string;
    avatar_url: string | null;
  }[];
}

export default function FriendRequests() {
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestData[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"suggestions" | "friends">("suggestions");
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
    loadFriends();
    loadSuggestions();

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

      // Load received requests with mutual friends
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

      // Process the requests and try to get mutual friends
      const processedRequests: FriendRequestData[] = received?.map(request => ({
        id: request.id,
        created_at: request.created_at,
        sender: {
          id: request.user.id,
          username: request.user.username,
          avatar_url: request.user.avatar_url
        },
        mutual_friends: [] // Initialize with empty array
      })) || [];

      setReceivedRequests(processedRequests);
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

  const loadFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Simple query to get friends
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
      
      // Transform the data to match our Friend interface
      const processedFriends = data?.map(item => ({
        id: item.friend.id,
        username: item.friend.username,
        avatar_url: item.friend.avatar_url,
        mutual_friends_count: 0 // We'll implement this later
      })) || [];
      
      setFriends(processedFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In a real app, you'd have a more sophisticated suggestion algorithm
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .neq('id', user.id)
        .limit(5);

      if (error) throw error;

      // Transform the data to match our Suggestion interface
      const processedSuggestions = data?.map(suggestion => ({
        id: suggestion.id,
        username: suggestion.username,
        avatar_url: suggestion.avatar_url,
        mutual_friends: [] // We'll implement this later
      })) || [];

      setSuggestions(processedSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
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

  const handleFriendRequest = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: userId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Solicitud enviada",
        description: "Se ha enviado la solicitud de amistad",
      });

      // Remove from suggestions
      setSuggestions(prev => prev.filter(s => s.id !== userId));
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la solicitud",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FriendRequestsHeader />

      <main className="p-3 pb-16 max-w-xl mx-auto">
        <FriendTabSelector 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        <RequestsSection 
          receivedRequests={receivedRequests} 
          handleRequest={handleRequest} 
        />

        {activeTab === "suggestions" && (
          <SuggestionsSection 
            suggestions={suggestions} 
            handleFriendRequest={handleFriendRequest} 
          />
        )}

        {activeTab === "friends" && (
          <FriendsListSection friends={friends} />
        )}

        <Navigation />
      </main>
    </div>
  );
}
