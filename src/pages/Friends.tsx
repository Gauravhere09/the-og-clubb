
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, UserPlus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFriends } from "@/hooks/use-friends";

export default function Friends() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { friends, friendRequests, suggestions, loading, sendFriendRequest, respondToFriendRequest } = useFriends(currentUserId);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

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
          </TabsList>

          <TabsContent value="requests">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Solicitudes de amistad</h2>
              {friendRequests.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No tienes solicitudes de amistad pendientes
                </p>
              ) : (
                <div className="space-y-4">
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.user.avatar_url || undefined} />
                          <AvatarFallback>
                            {request.user.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{request.user.username}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => respondToFriendRequest(request.id, true)}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => respondToFriendRequest(request.id, false)}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="suggestions">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Personas que quizá conozcas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={suggestion.avatar_url || undefined} />
                        <AvatarFallback>
                          {suggestion.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{suggestion.username}</div>
                        {suggestion.mutual_friends_count > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <Users className="inline-block h-3 w-3 mr-1" />
                            {suggestion.mutual_friends_count} amigos en común
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendFriendRequest(suggestion.id)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Todos los amigos</h2>
              {friends.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Aún no tienes amigos agregados
                </p>
              ) : (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.friend_id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={friend.friend_avatar_url || undefined} />
                          <AvatarFallback>
                            {friend.friend_username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{friend.friend_username}</div>
                      </div>
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
