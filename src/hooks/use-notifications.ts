
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useNotifications() {
  const { toast } = useToast();

  const { data: notifications, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles!sender_id(username, avatar_url),
          posts(*),
          comments(*)
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && payload.new.receiver_id === user.id) {
            refetch();
            
            // Obtener información del remitente
            const { data: senderData } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', payload.new.sender_id)
              .single();

            let message = '';
            switch (payload.new.type) {
              case 'post_like':
                message = `${senderData?.username} ha reaccionado a tu publicación`;
                break;
              case 'post_comment':
                message = `${senderData?.username} ha comentado en tu publicación`;
                break;
              case 'comment_reply':
                message = `${senderData?.username} ha respondido a tu comentario`;
                break;
              case 'new_post':
                message = `${senderData?.username} ha realizado una nueva publicación`;
                break;
            }

            toast({
              title: "Nueva notificación",
              description: message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, toast]);

  return { notifications };
}
