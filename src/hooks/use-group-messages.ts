
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GroupMessage {
  id: string;
  content: string;
  sender_id: string;
  type: 'text' | 'audio' | 'image';
  media_url: string | null;
  created_at: string;
  is_deleted: boolean;
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
          type: message.type as 'text' | 'audio' | 'image',
          media_url: message.media_url,
          created_at: message.created_at,
          is_deleted: Boolean(message.is_deleted || false), // Ensure it's a boolean with default
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
      .channel('group-messages-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'group_messages' 
      }, async (payload) => {
        console.log('Nuevo mensaje grupal recibido:', payload.new);
        const { data: senderData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', payload.new.sender_id)
          .single();

        const newMessage: GroupMessage = {
          id: payload.new.id,
          content: payload.new.content,
          sender_id: payload.new.sender_id,
          type: payload.new.type as 'text' | 'audio' | 'image',
          media_url: payload.new.media_url,
          created_at: payload.new.created_at,
          is_deleted: Boolean(payload.new.is_deleted || false), // Ensure it has a default value
          sender: senderData || undefined
        };

        setGroupMessages(prev => [...prev, newMessage]);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'group_messages'
      }, (payload) => {
        console.log('Mensaje grupal eliminado:', payload.old.id);
        setGroupMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
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
  type: 'text' | 'audio' | 'image' = 'text',
  mediaBlob?: Blob
) {
  if (!senderId) {
    console.error("Error: No hay ID de remitente para enviar el mensaje");
    return null;
  }

  console.info(`Enviando mensaje grupal: ${content} ${type}`);

  try {
    let media_url = null;

    if (type === 'audio' && mediaBlob) {
      const fileName = `${crypto.randomUUID()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, mediaBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      media_url = publicUrl;
    }
    
    if (type === 'image' && mediaBlob) {
      const fileName = `group_image_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, mediaBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      media_url = publicUrl;
    }

    const { data, error } = await supabase
      .from('group_messages')
      .insert({
        content,
        sender_id: senderId,
        type,
        media_url,
        is_deleted: false
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('Mensaje grupal enviado correctamente:', data);
    return data;
  } catch (error) {
    console.error('Error enviando mensaje grupal:', error);
    throw error;
  }
}
