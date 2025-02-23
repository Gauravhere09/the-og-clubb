
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
  sender: {
    username: string;
    avatar_url: string | null;
  };
}

export function useGroupMessages(currentUserId: string | null, showGroupChat: boolean) {
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUserId || !showGroupChat) return;

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

        if (data) {
          const messages: GroupMessage[] = data.map(message => ({
            id: message.id,
            content: message.content,
            sender_id: message.sender_id,
            type: message.type as 'text' | 'audio',
            media_url: message.media_url,
            created_at: message.created_at,
            sender: {
              username: message.sender.username || '',
              avatar_url: message.sender.avatar_url
            }
          }));
          setGroupMessages(messages);
        }
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

    const subscription = supabase
      .channel('group_messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_messages',
      }, () => {
        loadGroupMessages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId, showGroupChat]);

  return { groupMessages };
}

export async function sendGroupMessage(
  currentUserId: string | null,
  content: string,
  type: 'text' | 'audio',
  audioBlob?: Blob
) {
  const { toast } = useToast();

  if (!currentUserId) return;

  try {
    let media_url = undefined;

    if (type === 'audio' && audioBlob) {
      const fileName = `${crypto.randomUUID()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('audio-messages')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('audio-messages')
        .getPublicUrl(fileName);

      media_url = publicUrl;
    }

    const { error } = await supabase
      .from('group_messages')
      .insert({
        content: content || '',
        sender_id: currentUserId,
        type,
        media_url
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error sending group message:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "No se pudo enviar el mensaje",
    });
  }
}
