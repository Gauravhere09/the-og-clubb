
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
    // Obtener usuario actual
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };

    getUserId();

    // Suscribirse a notificaciones en tiempo real
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
            // Notificar al usuario
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

    // Suscribirse a nuevas publicaciones
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
            // Si no es una publicación propia
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
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleHomeClick = () => {
    // Resetear contador de nuevas publicaciones
    setNewPosts(0);

    // Si ya estamos en la página principal, forzar scroll al inicio y mostrar publicaciones recientes
    if (location.pathname === "/") {
      // Usar searchParams para indicar que queremos mostrar publicaciones recientes
      navigate("/?new=true");
      // Hacer scroll al inicio de la página
      window.scrollTo(0, 0);
    } else {
      // Si no estamos en la página principal, navegar allí con el parámetro
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
