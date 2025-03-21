
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FriendRequestItem } from "@/components/friends/FriendRequestItem";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimeAgo } from "@/lib/utils";

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
        <div className="flex items-center justify-between mb-4 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
          <Button 
            variant={activeTab === "suggestions" ? "default" : "ghost"} 
            onClick={() => setActiveTab("suggestions")}
            className="flex-1 rounded-full"
          >
            Sugerencias
          </Button>
          <Button 
            variant={activeTab === "friends" ? "default" : "ghost"} 
            onClick={() => setActiveTab("friends")}
            className="flex-1 rounded-full"
          >
            Tus amigos
          </Button>
        </div>

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

          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow">
            {receivedRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-3">
                No tienes solicitudes de amistad pendientes
              </p>
            ) : (
              <div className="space-y-3">
                {receivedRequests.map((request) => (
                  <div key={request.id} className="flex items-start py-2">
                    <Avatar className="h-14 w-14 mr-3">
                      <AvatarImage src={request.sender.avatar_url || undefined} />
                      <AvatarFallback>{request.sender.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium truncate">{request.sender.username}</h3>
                          {request.mutual_friends && request.mutual_friends.length > 0 && (
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <div className="flex -space-x-2 mr-1">
                                {request.mutual_friends.slice(0, 2).map((friend, index) => (
                                  <Avatar key={index} className="h-4 w-4 border border-background">
                                    <AvatarImage src={friend.avatar_url || undefined} />
                                    <AvatarFallback>{friend.username[0]?.toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              {request.mutual_friends.length} {request.mutual_friends.length === 1 ? 'amigo' : 'amigos'} en común
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatTimeAgo(request.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-primary hover:bg-primary/90"
                          onClick={() => handleRequest(request.id, true)}
                        >
                          Confirmar
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleRequest(request.id, false)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {activeTab === "suggestions" && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Personas que quizás conozcas</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {suggestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-3">
                  No hay sugerencias disponibles en este momento
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-center justify-between p-3">
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
            </div>
          </div>
        )}

        {activeTab === "friends" && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Todos tus amigos</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
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
            </div>
          </div>
        )}

        <Navigation />
      </main>
    </div>
  );
}
