import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { NavigationLink } from "./types";

export function useNavigation() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [newPosts, setNewPosts] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };

    getUserId();

    const notificationsChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiver_id=eq.${currentUserId}`
        },
        (payload) => {
          if (location.pathname !== "/notifications") {
            setUnreadNotifications(prev => prev + 1);
            const notif = payload.new as any;
            if (notif.type === "post_like") {
              toast({
                title: "Nueva notificación",
                description: "Alguien ha reaccionado a tu publicación"
              });
            } else if (notif.type === "post_comment") {
              toast({
                title: "Nueva notificación",
                description: "Alguien ha comentado en tu publicación"
              });
            } else if (notif.type === "friend_request") {
              toast({
                title: "Nueva notificación",
                description: "Has recibido una solicitud de seguimiento"
              });
            }
          }
        }
      )
      .subscribe();

    const postsChannel = supabase
      .channel("new-posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts"
        },
        (payload) => {
          if (location.pathname !== "/" && payload.new) {
            const post = payload.new as any;
            if (post.user_id !== currentUserId) {
              setNewPosts(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      notificationsChannel.unsubscribe();
      postsChannel.unsubscribe();
    };
  }, [currentUserId, location.pathname, toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      navigate("/auth");
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente."
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar sesión. Intenta nuevamente."
      });
    }
  };

  const handleHomeClick = () => {
    setNewPosts(0);

    if (location.pathname === "/") {
      navigate("/?new=true");
      window.scrollTo(0, 0);
    } else {
      navigate("/?new=true");
    }
  };

  const handleNotificationClick = () => {
    setUnreadNotifications(0);
  };

  return {
    currentUserId,
    unreadNotifications,
    newPosts,
    handleLogout,
    handleHomeClick,
    handleNotificationClick,
    location
  };
}
