
import { Bell, Home, Mail, User, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Logo = () => (
  <div className="hidden md:flex justify-center my-6">
    <Link to="/" className="relative w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform transition-transform hover:scale-105">
      <span className="text-2xl font-bold text-primary-foreground">H</span>
      <div className="absolute -inset-0.5 bg-primary/20 rounded-xl blur-sm -z-10" />
    </Link>
  </div>
);

export function Navigation() {
  const location = useLocation();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [newPosts, setNewPosts] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);

        // Cargar notificaciones no leídas iniciales
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('read', false);

        setUnreadNotifications(count || 0);

        // Suscribirse a nuevas notificaciones
        const notificationsChannel = supabase.channel('notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `receiver_id=eq.${user.id}`,
            },
            async (payload) => {
              setUnreadNotifications(prev => prev + 1);
              
              // Obtener detalles del remitente
              const { data: sender } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', payload.new.sender_id)
                .single();

              toast({
                title: "Nueva notificación",
                description: `${sender?.username || 'Alguien'} ${payload.new.message}`,
              });
            }
          )
          .subscribe();

        // Suscribirse a nuevas publicaciones
        const postsChannel = supabase.channel('posts')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'posts',
            },
            (payload) => {
              if (location.pathname !== '/' && payload.new.user_id !== user.id) {
                setNewPosts(prev => prev + 1);
              }
            }
          )
          .subscribe();

        return () => {
          notificationsChannel.unsubscribe();
          postsChannel.unsubscribe();
        };
      }
    };

    getCurrentUser();
  }, [location.pathname]);

  // Resetear contador de nuevas publicaciones cuando se navega a inicio
  useEffect(() => {
    if (location.pathname === '/') {
      setNewPosts(0);
    }
  }, [location.pathname]);

  const links = [
    { 
      to: "/", 
      icon: Home, 
      label: "Inicio",
      badge: newPosts > 0 ? newPosts : null 
    },
    { 
      to: "/messages", 
      icon: Mail, 
      label: "Mensajes" 
    },
    { 
      to: "/friends", 
      icon: Users, 
      label: "Amigos" 
    },
    { 
      to: "/notifications", 
      icon: Bell, 
      label: "Notificaciones",
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      onClick: async () => {
        if (currentUserId) {
          // Marcar todas las notificaciones como leídas
          await supabase
            .from('notifications')
            .update({ read: true })
            .eq('receiver_id', currentUserId)
            .eq('read', false);
          setUnreadNotifications(0);
        }
      }
    },
    { 
      to: currentUserId ? `/profile/${currentUserId}` : "/", 
      icon: User, 
      label: "Perfil" 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-background border-t md:relative md:border-t-0 md:border-r md:w-[70px] md:h-screen z-50">
      <Logo />
      <div className="flex justify-around md:flex-col md:h-full md:justify-start md:pt-6 md:gap-8">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={link.onClick}
              className={`p-4 transition-colors hover:text-primary relative ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-6 h-6" />
              {link.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs"
                >
                  {link.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
