
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useFriends } from "@/hooks/use-friends";
import { FriendRequestsList } from "@/components/friends/FriendRequestsList";
import { FriendSuggestionsList } from "@/components/friends/FriendSuggestionsList";
import { AllFriendsList } from "@/components/friends/AllFriendsList";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SentRequest {
  id: string;
  friend: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
  status: string;
}

export default function Friends() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const { friends, friendRequests, suggestions, loading, sendFriendRequest, respondToFriendRequest } = useFriends(currentUserId);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadSentRequests();
    }
  }, [currentUserId]);

  const loadSentRequests = async () => {
    if (!currentUserId) return;

    const { data, error } = await supabase
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
      .eq('user_id', currentUserId)
      .eq('status', 'pending');

    if (!error && data) {
      setSentRequests(data);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', requestId);

    if (!error) {
      await loadSentRequests();
    }
  };

  if (!currentUserId) {
    return (
      <div className="min-h-screen flex bg-muted/30">
        <Navigation />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Debes iniciar sesión para ver esta página.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto p-6">
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">
              Solicitudes
              {friendRequests.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {friendRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions">Sugerencias</TabsTrigger>
            <TabsTrigger value="all">Todos los amigos</TabsTrigger>
            <TabsTrigger value="sent">Enviadas</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <FriendRequestsList 
              requests={friendRequests}
              onRespond={respondToFriendRequest}
            />
          </TabsContent>

          <TabsContent value="suggestions">
            <FriendSuggestionsList 
              suggestions={suggestions}
              onSendRequest={sendFriendRequest}
            />
          </TabsContent>

          <TabsContent value="all">
            <AllFriendsList friends={friends} />
          </TabsContent>

          <TabsContent value="sent">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Solicitudes enviadas</h2>
              {sentRequests.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No has enviado ninguna solicitud de amistad
                </p>
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
                          <AvatarFallback>
                            {request.friend.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{request.friend.username}</div>
                          <div className="text-sm text-muted-foreground">Pendiente</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        Cancelar solicitud
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
