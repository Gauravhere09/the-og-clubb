
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { RealtimeNotification, RealtimePostPayload } from "./types";

export function useNavigation() {
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

        // Obtener cantidad de posts nuevos (últimas 24 horas)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const { count: newPostsCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', twentyFourHoursAgo.toISOString());

        setNewPosts(newPostsCount || 0);

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
      } else {
        navigate('/auth');
      }
    };

    getCurrentUser();
  }, [location.pathname, toast, navigate]);

  useEffect(() => {
    if (location.pathname === '/' && location.search.includes('new=true')) {
      setNewPosts(0);
      setLatestPostId(null);
    }
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente"
      });
      
      navigate('/auth');
      setCurrentUserId(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar la sesión"
      });
    }
  };

  const handleHomeClick = () => {
    if (newPosts > 0) {
      navigate('/?new=true');
      setNewPosts(0);
      setLatestPostId(null);
    } else {
      navigate('/');
    }
  };

  const handleNotificationClick = async () => {
    if (currentUserId) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('receiver_id', currentUserId);
      setUnreadNotifications(0);
    }
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
