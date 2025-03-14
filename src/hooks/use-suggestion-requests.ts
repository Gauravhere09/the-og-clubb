
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useSuggestionRequests() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [pendingRequests, setPendingRequests] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const sendFriendRequest = async (friendId: string) => {
    setLoadingStates(prev => ({ ...prev, [friendId]: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para enviar solicitudes",
          variant: "destructive"
        });
        return false;
      }

      // Comprobamos si ya existe una solicitud pendiente
      const { data: existingRequest } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', user.id)
        .eq('friend_id', friendId)
        .single();

      if (existingRequest) {
        toast({
          title: "Ya existe una solicitud",
          description: "Ya has enviado una solicitud a este usuario",
        });
        return false;
      }

      // Enviamos la solicitud (status: 'pending')
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Enviamos notificación al usuario
      await supabase
        .from('notifications')
        .insert({
          type: 'friend_request',
          sender_id: user.id,
          receiver_id: friendId,
          read: false
        });

      setPendingRequests(prev => ({ ...prev, [friendId]: true }));
      toast({
        title: "Solicitud enviada",
        description: "Se ha enviado la solicitud de amistad"
      });
      return true;
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoadingStates(prev => ({ ...prev, [friendId]: false }));
    }
  };

  return {
    loadingStates,
    pendingRequests,
    sendFriendRequest
  };
}
