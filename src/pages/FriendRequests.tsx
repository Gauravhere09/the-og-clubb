
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FriendRequestsHeader } from "@/components/friends/FriendRequestsHeader";
import { FriendTabSelector } from "@/components/friends/FriendTabSelector";
import { RequestsSection } from "@/components/friends/RequestsSection";
import { SuggestionsSection } from "@/components/friends/SuggestionsSection";
import { FriendsListSection } from "@/components/friends/FriendsListSection";
import { useFriends } from "@/hooks/use-friends";

export default function FriendRequests() {
  const [activeTab, setActiveTab] = useState<"suggestions" | "friends">("suggestions");
  const { toast } = useToast();
  
  // Obtener el ID del usuario actual
  const getUserId = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id || null;
  };
  
  // Usar el hook useFriends con el ID del usuario obtenido de la sesión actual
  const { 
    pendingRequests, 
    suggestions, 
    friends,
    loading,
    handleFriendRequest, 
    dismissSuggestion 
  } = useFriends(getUserId());

  // Manejar la respuesta a solicitudes de amistad (aceptar/rechazar)
  const handleRequest = async (requestId: string, accept: boolean) => {
    try {
      // Utilizamos la función del hook
      await handleFriendRequest(requestId, "", accept);
      
      toast({
        title: accept ? "Solicitud aceptada" : "Solicitud rechazada",
        description: accept 
          ? "Ahora son amigos" 
          : "Has rechazado la solicitud de amistad",
      });
    } catch (error) {
      console.error('Error handling request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la solicitud",
      });
    }
  };

  // Manejar el envío de solicitudes de amistad
  const handleFriendRequestSend = async (userId: string) => {
    try {
      await handleFriendRequest(userId, "", true);
      
      toast({
        title: "Solicitud enviada",
        description: "Se ha enviado la solicitud de amistad",
      });
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
      <FriendRequestsHeader />

      <main className="p-3 pb-16 max-w-xl mx-auto">
        <FriendTabSelector 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        <RequestsSection 
          receivedRequests={pendingRequests} 
          handleRequest={handleRequest} 
        />

        {activeTab === "suggestions" && (
          <SuggestionsSection 
            suggestions={suggestions} 
            handleFriendRequest={handleFriendRequestSend} 
          />
        )}

        {activeTab === "friends" && (
          <FriendsListSection friends={friends} />
        )}

        <Navigation />
      </main>
    </div>
  );
}
