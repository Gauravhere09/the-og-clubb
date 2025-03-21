
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FriendRequestItem } from "@/components/friends/FriendRequestItem";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";

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

interface SentRequestData {
  id: string;
  created_at: string;
  friend: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  status: string;
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
  const navigate = useNavigate();

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

      // Get mutual friends for each request
      const processedRequests: FriendRequestData[] = [];
      
      for (const request of received || []) {
        // Get mutual friends (this is a simplified version - in a real app you'd have a more efficient query)
        const { data: mutualFriends } = await supabase.rpc('get_mutual_friends', {
          user_id_1: user.id,
          user_id_2: request.user.id
        });

        processedRequests.push({
          id: request.id,
          created_at: request.created_at,
          sender: {
            id: request.user.id,
            username: request.user.username,
            avatar_url: request.user.avatar_url
          },
          mutual_friends: mutualFriends || []
        });
      }

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

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          avatar_url
        `)
        .in('id', supabase.rpc('get_friends', { user_id_param: user.id }));

      if (error) throw error;
      setFriends(data || []);
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

      // Get mutual friends for each suggestion
      const processedSuggestions: Suggestion[] = [];
      
      for (const suggestion of data || []) {
        // Get mutual friends
        const { data: mutualFriends } = await supabase.rpc('get_mutual_friends', {
          user_id_1: user.id,
          user_id_2: suggestion.id
        });

        processedSuggestions.push({
          id: suggestion.id,
          username: suggestion.username,
          avatar_url: suggestion.avatar_url,
          mutual_friends: mutualFriends || []
        });
      }

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
      <header className="sticky top-0 z-10 bg-background border-b p-2">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Amigos</h1>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-3 pb-16 max-w-xl mx-auto">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "suggestions" | "friends")} className="mb-4">
          <TabsList className="grid grid-cols-2 w-full rounded-full h-10 p-1 bg-muted/80">
            <TabsTrigger value="suggestions" className="rounded-full">Sugerencias</TabsTrigger>
            <TabsTrigger value="friends" className="rounded-full">Tus amigos</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Solicitudes de amistad</h2>
            {receivedRequests.length > 5 && (
              <Link to="/friends/requests" className="text-sm text-primary flex items-center">
                Ver todo
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <Card className="p-3">
            {receivedRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-3">
                No tienes solicitudes de amistad pendientes
              </p>
            ) : (
              <div className="divide-y divide-border">
                {receivedRequests.map((request) => (
                  <FriendRequestItem
                    key={request.id}
                    id={request.id}
                    sender={request.sender}
                    created_at={request.created_at}
                    mutual_friends={request.mutual_friends}
                    onAccept={(id) => handleRequest(id, true)}
                    onReject={(id) => handleRequest(id, false)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        <TabsContent value="suggestions" className="mt-0 p-0">
          <h2 className="text-lg font-semibold mb-2">Personas que quizás conozcas</h2>
          <Card className="p-3">
            {suggestions.length === 0 ? (
              <p className="text-center text-muted-foreground py-3">
                No hay sugerencias disponibles en este momento
              </p>
            ) : (
              <div className="divide-y divide-border">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="flex items-center justify-between py-3">
                    <div className="flex items-start gap-3">
                      <Link to={`/profile/${suggestion.id}`} className="shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={suggestion.avatar_url || undefined} />
                          <AvatarFallback>{suggestion.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex flex-col">
                        <Link to={`/profile/${suggestion.id}`} className="font-medium">
                          {suggestion.username}
                        </Link>
                        {suggestion.mutual_friends && suggestion.mutual_friends.length > 0 && (
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <div className="flex -space-x-2 mr-1">
                              {suggestion.mutual_friends.slice(0, 2).map((friend, index) => (
                                <Avatar key={index} className="h-4 w-4 border border-background">
                                  <AvatarImage src={friend.avatar_url || undefined} />
                                  <AvatarFallback>{friend.username[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            {suggestion.mutual_friends.length} {suggestion.mutual_friends.length === 1 ? 'amigo' : 'amigos'} en común
                          </div>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleFriendRequest(suggestion.id)}
                      className="px-3 py-1 h-8"
                    >
                      Añadir
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="mt-0 p-0">
          <h2 className="text-lg font-semibold mb-2">Todos tus amigos</h2>
          <Card className="p-3">
            {friends.length === 0 ? (
              <p className="text-center text-muted-foreground py-3">
                Aún no tienes amigos
              </p>
            ) : (
              <div className="divide-y divide-border">
                {friends.map((friend) => (
                  <Link 
                    key={friend.id} 
                    to={`/profile/${friend.id}`}
                    className="flex items-center py-3 hover:bg-accent/50 rounded-md px-2"
                  >
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src={friend.avatar_url || undefined} />
                      <AvatarFallback>{friend.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{friend.username}</p>
                      {friend.mutual_friends_count && friend.mutual_friends_count > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {friend.mutual_friends_count} {friend.mutual_friends_count === 1 ? 'amigo' : 'amigos'} en común
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <Navigation />
      </main>
    </div>
  );
}
