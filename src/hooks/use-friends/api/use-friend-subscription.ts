
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useFriendSubscription(
  currentUserId: string | null,
  onDataChange: () => void
) {
  const setupSubscription = useCallback(() => {
    if (!currentUserId) return { unsubscribe: () => {} };

    // Suscribirse a cambios en 'friendships'
    const friendshipsChannel = supabase
      .channel('friendship_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships',
      }, () => {
        // Recargamos los datos cuando hay cambios
        onDataChange();
      })
      .subscribe();

    return {
      unsubscribe: () => supabase.removeChannel(friendshipsChannel)
    };
  }, [currentUserId, onDataChange]);

  useEffect(() => {
    const { unsubscribe } = setupSubscription();
    
    return () => {
      unsubscribe();
    };
  }, [setupSubscription]);

  return null; // This hook doesn't return anything, it just sets up the subscription
}
