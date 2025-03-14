
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getFriendSuggestions } from "@/lib/api/friends/suggestions";
import { FriendSuggestion } from "@/types/friends";

export function usePeopleSuggestions() {
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedFriends, setRequestedFriends] = useState<Record<string, boolean>>({});
  const [dismissedFriends, setDismissedFriends] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const data = await getFriendSuggestions();
        // Get more suggestions for the carousel
        setSuggestions(data.slice(0, 10));
      } catch (error) {
        console.error("Error fetching friend suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

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

  // Filter out dismissed suggestions
  const visibleSuggestions = suggestions.filter(
    sugg => !dismissedFriends[sugg.id]
  );

  return {
    suggestions: visibleSuggestions,
    loading,
    requestedFriends,
    handleSendRequest,
    handleDismiss
  };
}
