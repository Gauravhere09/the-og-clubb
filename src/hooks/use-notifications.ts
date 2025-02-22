
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { NotificationType } from "@/types/notifications";

interface NotificationWithSender {
  id: string;
  type: NotificationType;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  created_at: string;
  message?: string;
  post_id?: string;
  comment_id?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationWithSender[]>([]);
  const { toast } = useToast();

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: notificationsData, error } = await supabase
      .from('notifications')
      .select(`
        id,
        type,
        created_at,
        message,
        post_id,
        comment_id,
        sender:profiles!sender_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading notifications:', error);
      return;
    }

    if (notificationsData) {
      setNotifications(notificationsData.map(notification => ({
        id: notification.id,
        type: notification.type as NotificationType,
        created_at: notification.created_at,
        message: notification.message ?? undefined,
        post_id: notification.post_id ?? undefined,
        comment_id: notification.comment_id ?? undefined,
        sender: {
          id: notification.sender.id,
          username: notification.sender.username || '',
          avatar_url: notification.sender.avatar_url
        }
      })));
    }
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

  const handleFriendRequest = async (notificationId: string, senderId: string, accept: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('friendships')
        .upsert({
          user_id: user.id,
          friend_id: senderId,
          status: accept ? 'accepted' : 'rejected'
        });

      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      toast({
        title: accept ? "Solicitud aceptada" : "Solicitud rechazada",
        description: accept ? "Ahora son amigos" : "Has rechazado la solicitud de amistad",
      });

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la solicitud",
      });
    }
  };

  return {
    notifications,
    handleFriendRequest
  };
};
