
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFriends } from "@/hooks/use-friends";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function Friends() {
  const [userId, setUserId] = useState<string | null>(null);
  const { friendRequests, respondToFriendRequest } = useFriends(userId);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    try {
      await respondToFriendRequest(requestId, accept);
      toast({
        title: accept ? "Solicitud aceptada" : "Solicitud rechazada",
        description: accept ? "Ahora son amigos" : "Has rechazado la solicitud de amistad",
      });
    } catch (error: any) {
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
        <h1 className="text-2xl font-bold mb-6">Solicitudes de amistad</h1>
        <div className="space-y-4">
          {friendRequests.length === 0 ? (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">
                No tienes solicitudes de amistad pendientes
              </p>
            </Card>
          ) : (
            friendRequests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.user.avatar_url || undefined} />
                      <AvatarFallback>
                        {request.user.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.user.username}</p>
                      <p className="text-sm text-muted-foreground">
                        Quiere ser tu amigo
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRespondToRequest(request.id, true)}
                      size="sm"
                    >
                      Aceptar
                    </Button>
                    <Button
                      onClick={() => handleRespondToRequest(request.id, false)}
                      variant="outline"
                      size="sm"
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
