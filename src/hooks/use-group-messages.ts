
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/database.types";
import { useToast } from "@/hooks/use-toast";

export type GroupMessage = Database['public']['Tables']['group_messages']['Row'] & {
  sender: {
    username: string;
    avatar_url: string | null;
  };
};

export function useGroupMessages(currentUserId: string | null, showGroupChat: boolean) {
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUserId || !showGroupChat) return;

    const loadGroupMessages = async () => {
      try {
        const { data, error } = await supabase
          .from<'group_messages'>('group_messages')
          .select(`
            *,
            profiles:sender_id (
              username,
              avatar_url
            )
          `)
          .returns<(Database['public']['Tables']['group_messages']['Row'] & {
            profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'username' | 'avatar_url'>;
          })[]>();

        if (error) throw error;

        if (data) {
          const formattedMessages: GroupMessage[] = data.map(message => ({
            ...message,
            sender: {
              username: message.profiles.username || '',
              avatar_url: message.profiles.avatar_url
            }
          }));
          setGroupMessages(formattedMessages);
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
      .from<'group_messages'>('group_messages')
      .insert({
        content: content || '',
        sender_id: currentUserId,
        type: type,
        media_url: media_url
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
