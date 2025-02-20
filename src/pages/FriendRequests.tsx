import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Loader2, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import type { Tables } from "@/types/database.types";

interface FriendRequest {
  id: string;
  sender: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

export default function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();

    const subscription = supabase
      .channel('friend_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friend_requests'
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
        .from('friend_requests')
        .select(`
          id,
          sender:profiles!friend_requests_sender_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      setRequests(data as FriendRequest[]);
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
        .from('friend_requests')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', requestId)
        .select('sender_id')
        .single();

      if (requestError) throw requestError;

      if (accept && requestData) {
        const friendInserts: Tables['friends']['Insert'][] = [
          { user_id: user.id, friend_id: requestData.sender_id },
          { user_id: requestData.sender_id, friend_id: user.id }
        ];

        const { error: friendshipError } = await supabase
          .from('friends')
          .insert(friendInserts);

        if (friendshipError) throw friendshipError;
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
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Solicitudes de amistad</h2>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No tienes solicitudes de amistad pendientes
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-accent"
                >
                  <Link
                    to={`/profile/${request.sender.id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar>
                      <AvatarImage src={request.sender.avatar_url || undefined} />
                      <AvatarFallback>
                        {request.sender.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {request.sender.username || "Usuario"}
                    </span>
                  </Link>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRequest(request.id, true)}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Aceptar
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRequest(request.id, false)}
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
      </main>
    </div>
  );
}
