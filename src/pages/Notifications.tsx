
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'friend_request' | 'message' | 'like' | 'new_post';
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  created_at: string;
  message?: string;
}

const NotificationIcon = ({ type }: { type: 'friend_request' | 'message' | 'like' | 'new_post' }) => {
  switch (type) {
    case "friend_request":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case "message":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "new_post":
      return <MessageCircle className="h-4 w-4 text-purple-500" />;
    default:
      return null;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener notificaciones
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
          type: item.type as 'friend_request' | 'message' | 'like' | 'new_post',
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

      // Marcar todas como leídas
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('read', false);
    };

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

      // Actualizar el estado de la amistad
      const { error: friendshipError } = await supabase
        .from('friends')
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

  const renderNotificationContent = (notification: Notification) => {
    if (notification.message) {
      return (
        <span>
          <span className="font-medium">{notification.sender.username}</span> {notification.message}
        </span>
      );
    }

    switch (notification.type) {
      case 'friend_request':
        return (
          <div className="flex items-center gap-2">
            <span>
              <span className="font-medium">{notification.sender.username}</span> te envió una solicitud de amistad
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFriendRequest(notification.id, notification.sender.id, true)}
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFriendRequest(notification.id, notification.sender.id, false)}
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      case 'message':
        return (
          <span>
            <span className="font-medium">{notification.sender.username}</span> te envió un mensaje
          </span>
        );
      case 'like':
        return (
          <span>
            <span className="font-medium">{notification.sender.username}</span> le dio me gusta a tu publicación
          </span>
        );
      case 'new_post':
        return (
          <span>
            <span className="font-medium">{notification.sender.username}</span> ha realizado una nueva publicación
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
        <h1 className="text-2xl font-semibold mb-6">Notificaciones</h1>
        <Card>
          <ScrollArea className="h-[calc(100vh-200px)]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                >
                  <Avatar>
                    <AvatarImage src={notification.sender.avatar_url || undefined} />
                    <AvatarFallback>{notification.sender.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {renderNotificationContent(notification)}
                    <p className="text-sm text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <NotificationIcon type={notification.type} />
                </div>
              ))
            )}
          </ScrollArea>
        </Card>
      </main>
    </div>
  );
};

export default Notifications;
