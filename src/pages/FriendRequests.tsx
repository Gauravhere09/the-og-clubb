
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
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

export default function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequestData[]>([]);
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

      const { data, error } = await supabase
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

      if (error) throw error;

      if (data) {
        const processedRequests = data.map(request => ({
          id: request.id,
          sender: {
            id: request.user?.id || '',
            username: request.user?.username || '',
            avatar_url: request.user?.avatar_url
          }
        }));
        setRequests(processedRequests);
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
          <h2 className="text-2xl font-bold mb-6">Solicitudes de amistad</h2>
          {requests.length === 0 ? (
            <NoRequests />
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
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
        </Card>
      </main>
    </div>
  );
}
