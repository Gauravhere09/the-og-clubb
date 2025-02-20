
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FriendSearch } from "@/components/FriendSearch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, UserX } from "lucide-react";
import { Link } from "react-router-dom";

interface FriendRequest {
  id: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
}

export default function Friends() {
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadFriendsAndRequests();
    
    // Suscribirse a cambios en la tabla friendships
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
  }, []);

  const loadFriendsAndRequests = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Cargar amigos
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select(`
          friend:profiles!friendships_friend_id_fkey(
            id,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (friendshipsError) throw friendshipsError;

      // Cargar solicitudes pendientes
      const { data: requests, error: requestsError } = await supabase
        .from('friendships')
        .select(`
          id,
          sender:profiles!friendships_user_id_fkey(
            username,
            avatar_url
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      setFriends(friendships?.map(f => ({
        friend_id: f.friend.id,
        friend_username: f.friend.username || '',
        friend_avatar_url: f.friend.avatar_url
      })) || []);

      setFriendRequests(requests?.map(r => ({
        id: r.id,
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

  const handleFriendRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: accept ? 'accepted' : 'rejected' })
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
      console.error('Error handling friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la solicitud",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-muted/30">
        <Navigation />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto p-6">
        <Tabs defaultValue="friends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="friends">Amigos</TabsTrigger>
            <TabsTrigger value="requests">
              Solicitudes
              {friendRequests.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {friendRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="search">Buscar</TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <Card className="p-6">
              {friends.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Aún no tienes amigos. ¡Busca personas para conectar!
                </p>
              ) : (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.friend_id}
                      className="flex items-center justify-between"
                    >
                      <Link
                        to={`/profile/${friend.friend_id}`}
                        className="flex items-center gap-3 hover:bg-accent rounded-lg p-2 flex-1"
                      >
                        <Avatar>
                          <AvatarImage src={friend.friend_avatar_url || undefined} />
                          <AvatarFallback>
                            {friend.friend_username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{friend.friend_username}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card className="p-6">
              {friendRequests.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No tienes solicitudes de amistad pendientes
                </p>
              ) : (
                <div className="space-y-4">
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.user.avatar_url || undefined} />
                          <AvatarFallback>
                            {request.user.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{request.user.username}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleFriendRequest(request.id, true)}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleFriendRequest(request.id, false)}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <FriendSearch />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
