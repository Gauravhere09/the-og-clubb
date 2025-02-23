
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GroupMessage {
  id: string;
  content: string;
  sender_id: string;
  type: 'text' | 'audio';
  media_url: string | null;
  created_at: string;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
}

export function useGroupMessages(currentUserId: string | null, enabled: boolean) {
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled || !currentUserId) return;

    const loadGroupMessages = async () => {
      try {
        // Verificamos si el usuario ya está en el grupo
        const { data: existingMember } = await supabase
          .from('group_members')
          .select('*')
          .eq('user_id', currentUserId)
          .single();

        // Si no está en el grupo, lo agregamos
        if (!existingMember) {
          await supabase
            .from('group_members')
            .insert({
              user_id: currentUserId,
              group_id: 'h', // ID fijo para el grupo "h"
              joined_at: new Date().toISOString()
            });

          toast({
            title: "¡Bienvenido al grupo h!",
            description: "Has sido agregado automáticamente al grupo de chat.",
          });
        }

        // Cargamos los mensajes del grupo
        const { data, error } = await supabase
          .from('group_messages')
          .select(`
            *,
            sender:profiles!group_messages_sender_id_fkey (
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        const transformedData = (data || []).map(message => ({
          id: message.id,
          content: message.content,
          sender_id: message.sender_id,
          type: message.type as 'text' | 'audio',
          media_url: message.media_url,
          created_at: message.created_at,
          sender: message.sender
        }));
        
        setGroupMessages(transformedData);
      } catch (error) {
        console.error('Error loading group messages:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los mensajes del grupo",
        });
      }
    };

    loadGroupMessages();

    const channel = supabase
      .channel('group-messages')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'group_messages' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage: GroupMessage = {
            id: payload.new.id,
            content: payload.new.content,
            sender_id: payload.new.sender_id,
            type: payload.new.type as 'text' | 'audio',
            media_url: payload.new.media_url,
            created_at: payload.new.created_at
          };
          setGroupMessages(prev => [...prev, newMessage]);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId, enabled, toast]);

  return { groupMessages };
}

export async function sendGroupMessage(
  senderId: string | null, 
  content: string, 
  type: 'text' | 'audio' = 'text',
  audioBlob?: Blob
) {
  if (!senderId) return;

  try {
    let media_url = null;

    if (type === 'audio' && audioBlob) {
      const fileName = `${crypto.randomUUID()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      media_url = publicUrl;
    }

    const { error } = await supabase
      .from('group_messages')
      .insert({
        content,
        sender_id: senderId,
        type,
        media_url
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error sending group message:', error);
    throw error;
  }
}
