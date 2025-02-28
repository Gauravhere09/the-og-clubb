
import { useState, useEffect, useCallback } from "react";
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
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // First, check if the table and columns exist to avoid SQL errors
      const { data: tableInfo, error: tableError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error('Error checking notifications table:', tableError);
        setIsLoading(false);
        return;
      }
      
      // Use a simple query first to fetch base notification data
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
          sender_id
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notifications:', error);
        setIsLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }

      // Get all unique sender IDs
      const senderIds = [...new Set(data.map(item => item.sender_id))];
      
      // Fetch sender profiles in a separate query
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', senderIds);
        
      if (profilesError) {
        console.error('Error loading sender profiles:', profilesError);
      }
      
      // Create a map of sender IDs to profiles for quick lookup
      const profileMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.id, profile);
        });
      }
      
      // Map notifications with sender info
      const notificationsWithSenders = data.map(notification => {
        const senderProfile = profileMap.get(notification.sender_id) || {
          id: notification.sender_id,
          username: 'Usuario',
          avatar_url: null
        };
        
        return {
          id: notification.id,
          type: notification.type as NotificationType,
          created_at: notification.created_at,
          message: notification.message ?? undefined,
          post_id: notification.post_id ?? undefined,
          comment_id: notification.comment_id ?? undefined,
          read: notification.read,
          sender: {
            id: senderProfile.id,
            username: senderProfile.username,
            avatar_url: senderProfile.avatar_url
          }
        };
      });
      
      setNotifications(notificationsWithSenders);
      
      // Count unread notifications
      const unreadCount = notificationsWithSenders.filter(n => !n.read).length;
      setUnreadCount(unreadCount);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error in loadNotifications:', error);
      setIsLoading(false);
    }
  }, []);

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
          // Play notification sound
          try {
            const notificationSound = new Audio('/notification.mp3');
            await notificationSound.play();
          } catch (error) {
            console.error('Error playing notification sound:', error);
          }
          
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
            setUnreadCount(prev => prev + 1);
            
            toast({
              title: "Nueva notificación",
              description: formatNotificationMessage(payload.new.type, senderData.username),
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === payload.new.id 
                ? { ...notification, read: payload.new.read }
                : notification
            )
          );
          
          // Update unread count if a notification was marked as read
          if (payload.old.read === false && payload.new.read === true) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [loadNotifications]);

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

      // If accepting, create a new notification for the sender
      if (accept) {
        await supabase
          .from('notifications')
          .insert({
            type: 'friend_accepted',
            sender_id: user.id,
            receiver_id: senderId,
            message: 'Ha aceptado tu solicitud de amistad',
            read: false
          });
      }

      toast({
        title: accept ? "Solicitud aceptada" : "Solicitud rechazada",
        description: accept ? "Ahora son amigos" : "Has rechazado la solicitud de amistad",
        variant: accept ? "default" : "destructive"
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

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
      
      toast({
        title: "Notificaciones actualizadas",
        description: "Se han marcado todas las notificaciones como leídas",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron marcar las notificaciones como leídas",
      });
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    handleFriendRequest,
    markAsRead,
    markAllAsRead,
    loadNotifications
  };
};
