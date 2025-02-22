
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useFriends } from "@/hooks/use-friends";
import { FriendRequestsList } from "@/components/friends/FriendRequestsList";
import { FriendSuggestionsList } from "@/components/friends/FriendSuggestionsList";
import { AllFriendsList } from "@/components/friends/AllFriendsList";

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
        </Tabs>
      </main>
    </div>
  );
}
