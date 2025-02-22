
import { Bell, Home, Mail, User, Users, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { NotificationTable } from "@/types/database/social.types";

const Logo = () => (
  <div className="hidden md:flex justify-center my-6">
    <Link to="/" className="relative w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform transition-transform hover:scale-105">
      <span className="text-2xl font-bold text-primary-foreground">H</span>
      <div className="absolute -inset-0.5 bg-primary/20 rounded-xl blur-sm -z-10" />
    </Link>
  </div>
);

interface NavigationLink {
  to?: string;
  icon: React.ElementType;
  label: string;
  badge?: number | null;
  onClick?: () => void;
}

interface RealtimePostPayload {
  new: {
    id: string;
    user_id: string;
  };
}

interface RealtimeNotification {
  new: NotificationTable['Row'];
}

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [newPosts, setNewPosts] = useState(0);
  const [latestPostId, setLatestPostId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);

        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('read', false);

        setUnreadNotifications(count || 0);

        const notificationsChannel = supabase.channel('notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `receiver_id=eq.${user.id}`,
            },
            async (payload: RealtimeNotification) => {
              setUnreadNotifications(prev => prev + 1);
              
              if (payload.new.sender_id) {
                const { data: sender } = await supabase
                  .from('profiles')
                  .select('username')
                  .eq('id', payload.new.sender_id)
                  .single();

                toast({
                  title: "Nueva notificación",
                  description: `${sender?.username || 'Alguien'} ${payload.new.message || ''}`,
                });
              }
            }
          )
          .subscribe();

        const postsChannel = supabase.channel('posts')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'posts',
            },
            (payload: RealtimePostPayload) => {
              if (location.pathname !== '/' && payload.new.user_id !== user.id) {
                setNewPosts(prev => prev + 1);
                setLatestPostId(payload.new.id);
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
  }, [location.pathname, toast]);

  useEffect(() => {
    if (location.pathname === '/') {
      setNewPosts(0);
      setLatestPostId(null);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente"
      });
      
      navigate('/auth');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar la sesión"
      });
    }
  };

  const handleHomeClick = () => {
    if (newPosts > 0 && latestPostId) {
      navigate(`/post/${latestPostId}`);
      setNewPosts(0);
      setLatestPostId(null);
    } else {
      navigate('/');
    }
  };

  const links: NavigationLink[] = [
    { 
      onClick: handleHomeClick,
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
          const updateData: NotificationTable['Update'] = {
            read: true
          };
          await supabase
            .from('notifications')
            .update(updateData)
            .eq('receiver_id', currentUserId);
          setUnreadNotifications(0);
        }
      }
    },
    { 
      to: currentUserId ? `/profile/${currentUserId}` : "/", 
      icon: User, 
      label: "Perfil" 
    },
    {
      icon: LogOut,
      label: "Cerrar sesión",
      onClick: handleLogout
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-background border-t md:relative md:border-t-0 md:border-r md:w-[70px] md:h-screen z-50">
      <Logo />
      <div className="flex justify-around md:flex-col md:h-full md:justify-start md:pt-6 md:gap-8">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.to ? location.pathname === link.to : location.pathname === '/';
          return (
            <Link
              key={link.label}
              to={link.to || '#'}
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
