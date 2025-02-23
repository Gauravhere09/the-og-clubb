
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
  read: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationWithSender[]>([]);
  const { toast } = useToast();

  const formatNotificationMessage = (type: NotificationType, username: string) => {
    switch (type) {
      case 'friend_request':
        return `${username} te ha enviado una solicitud de amistad`;
      case 'post_comment':
        return `${username} ha comentado en tu publicación`;
      case 'comment_reply':
        return `${username} ha respondido a tu comentario`;
      case 'post_like':
        return `${username} ha reaccionado a tu publicación`;
      case 'new_post':
        return `${username} ha realizado una nueva publicación`;
      case 'friend_accepted':
        return `${username} ha aceptado tu solicitud de amistad`;
      default:
        return `Nueva notificación de ${username}`;
    }
  };

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
        post_id,
        comment_id,
        read,
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

    if (data) {
      setNotifications(data.map((notification: any) => ({
        id: notification.id,
        type: notification.type as NotificationType,
        created_at: notification.created_at,
        message: notification.message ?? undefined,
        post_id: notification.post_id ?? undefined,
        comment_id: notification.comment_id ?? undefined,
        read: notification.read,
        sender: {
          id: notification.sender?.id ?? '',
          username: notification.sender?.username ?? '',
          avatar_url: notification.sender?.avatar_url
        }
      })));
    }
  };

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        async (payload) => {
          // Fetch sender info for the new notification
          const { data: senderData, error: senderError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();
          
          if (!senderError && senderData) {
            const newNotification: NotificationWithSender = {
              id: payload.new.id,
              type: payload.new.type as NotificationType,
              created_at: payload.new.created_at,
              message: payload.new.message ?? undefined,
              post_id: payload.new.post_id ?? undefined,
              comment_id: payload.new.comment_id ?? undefined,
              read: payload.new.read,
              sender: {
                id: senderData.id,
                username: senderData.username,
                avatar_url: senderData.avatar_url
              }
            };

            setNotifications(prev => [newNotification, ...prev]);
            
            toast({
              title: "Nueva notificación",
              description: formatNotificationMessage(payload.new.type, senderData.username),
            });
          }
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
        .update({ read: true })
        .eq('id', notificationId);

      toast({
        title: accept ? "Solicitud aceptada" : "Solicitud rechazada",
        description: accept ? "Ahora son amigos" : "Has rechazado la solicitud de amistad",
      });

      loadNotifications();
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
