
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useFriendRequests() {
  const [requestedFriends, setRequestedFriends] = useState<Record<string, boolean>>({});
  const [dismissedFriends, setDismissedFriends] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleSendRequest = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para enviar solicitudes de amistad",
          variant: "destructive",
        });
        return;
      }

      // Send friend request
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      // Create notification for the recipient
      await supabase
        .from('notifications')
        .insert({
          type: 'friend_request',
          sender_id: user.id,
          receiver_id: friendId
        });

      // Update local state
      setRequestedFriends(prev => ({
        ...prev,
        [friendId]: true
      }));

      toast({
        title: "Solicitud enviada",
        description: "Se ha enviado la solicitud de amistad",
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = (friendId: string) => {
    setDismissedFriends(prev => ({
      ...prev, 
      [friendId]: true
    }));
  };

  return {
    requestedFriends,
    dismissedFriends,
    handleSendRequest,
    handleDismiss
  };
}
