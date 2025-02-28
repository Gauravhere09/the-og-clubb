
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const notificationSound = new Audio("/notification.mp3");

export const useMessageNotifications = (currentUserId: string | null) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`
        },
        async (payload) => {
          try {
            // Reproducir sonido de notificación
            notificationSound.play().catch(console.error);
            
            // Obtener información del remitente para mostrar en la notificación
            const { data: senderData } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', payload.new.sender_id)
              .single();
            
            if (senderData) {
              // Mostrar notificación toast con información del remitente
              toast({
                title: `Nuevo mensaje de ${senderData.username}`,
                description: payload.new.content.length > 30 
                  ? payload.new.content.substring(0, 30) + "..." 
                  : payload.new.content,
                duration: 5000,
              });
              
              // Crear notificación en la base de datos
              await supabase.from('notifications').insert({
                type: 'message',
                sender_id: payload.new.sender_id,
                receiver_id: currentUserId,
                message: "te envió un mensaje",
                read: false
              });
            }
          } catch (error) {
            console.error("Error en notificación de mensaje:", error);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId, toast]);
};
