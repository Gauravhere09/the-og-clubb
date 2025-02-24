
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const notificationSound = new Audio("/notification.mp3");

export const useMessageNotifications = (currentUserId: string | null) => {
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`
        },
        () => {
          notificationSound.play().catch(console.error);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId]);
};
