
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
      .is('read', false);
  };

  const handleFriendRequest = async (notificationId: string, senderId: string, accept: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Actualizar el estado de la amistad
      const { error: friendshipError } = await supabase
        .from('friendships')
        .upsert([
          {
            user_id: user.id,
            friend_id: senderId,
            status: accept ? 'accepted' : 'rejected'
          }
        ]);

      if (friendshipError) throw friendshipError;

      // Eliminar la notificación
      const { error: notificationError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (notificationError) throw notificationError;

      toast({
        title: accept ? "Solicitud aceptada" : "Solicitud rechazada",
        description: accept ? "Ahora son amigos" : "Has rechazado la solicitud de amistad",
      });

      // Actualizar la lista de notificaciones
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
    handleFriendRequest
  };
};
