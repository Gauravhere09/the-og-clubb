
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FriendRequestsLoader } from "@/components/friends/FriendRequestsLoader";
import { NoRequests } from "@/components/friends/NoRequests";
import { FriendRequestItem } from "@/components/friends/FriendRequestItem";

interface FriendRequestData {
  id: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface SentRequestData {
  id: string;
  friend: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  status: string;
}

export default function FriendRequests() {
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestData[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();

    const subscription = supabase
      .channel('friendships')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships'
      }, () => {
        loadRequests();
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

      // Cargar solicitudes recibidas
      const { data: received, error: receivedError } = await supabase
        .from('friendships')
        .select(`
          id,
          user:profiles!friendships_user_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (receivedError) throw receivedError;

      // Cargar solicitudes enviadas
      const { data: sent, error: sentError } = await supabase
        .from('friendships')
        .select(`
          id,
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
        const processedReceived: FriendRequestData[] = received.map(request => ({
          id: request.id,
          sender: {
            id: request.user?.id || '',
            username: request.user?.username || '',
            avatar_url: request.user?.avatar_url
          }
        }));
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
    } catch (error) {
      console.error('Error handling request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la solicitud",
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
      <main className="flex-1 max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="received">Recibidas</TabsTrigger>
              <TabsTrigger value="sent">Enviadas</TabsTrigger>
            </TabsList>

            <TabsContent value="received">
              <h2 className="text-2xl font-bold mb-6">Solicitudes recibidas</h2>
              {receivedRequests.length === 0 ? (
                <NoRequests />
              ) : (
                <div className="space-y-4">
                  {receivedRequests.map((request) => (
                    <FriendRequestItem
                      key={request.id}
                      id={request.id}
                      sender={request.sender}
                      onAccept={(id) => handleRequest(id, true)}
                      onReject={(id) => handleRequest(id, false)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent">
              <h2 className="text-2xl font-bold mb-6">Solicitudes enviadas</h2>
              {sentRequests.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No has enviado ninguna solicitud de amistad
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.friend.avatar_url || undefined} />
                          <AvatarFallback>{request.friend.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{request.friend.username}</div>
                          <div className="text-sm text-muted-foreground">Pendiente</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => cancelRequest(request.id)}
                      >
                        Cancelar solicitud
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
