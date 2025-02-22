
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NotificationType } from "@/types/notifications";

interface Notification {
  id: string;
  type: NotificationType;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  created_at: string;
  message?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        type,
        created_at,
        message,
        read,
        sender:profiles!sender_id(id, username, avatar_url)
      `)
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading notifications:', error);
      return;
    }

    if (data) {
      const typedNotifications: Notification[] = data.map(item => ({
        id: item.id,
        type: item.type as NotificationType,
        created_at: item.created_at,
        message: item.message,
        sender: {
          id: item.sender.id,
          username: item.sender.username || '',
          avatar_url: item.sender.avatar_url
        }
      }));
      setNotifications(typedNotifications);
    }

    // Marcar como leídas
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('receiver_id', user.id)
      .eq('read', false);
  };

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return {
    notifications,
  };
};
