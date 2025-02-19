
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/database.types";
import { useToast } from "@/hooks/use-toast";
import { Friend } from './use-friends';

export type Message = Database['public']['Tables']['messages']['Row'];

export function usePrivateMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const loadMessages = async (currentUserId: string, selectedFriend: Friend) => {
    if (!selectedFriend || !currentUserId) return;

    try {
      const { data, error } = await supabase
        .from<'messages'>('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedFriend.friend_id}),and(sender_id.eq.${selectedFriend.friend_id},receiver_id.eq.${currentUserId})`)
        .returns<Message[]>();

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los mensajes",
      });
    }
  };

  const sendMessage = async (content: string, currentUserId: string, selectedFriend: Friend) => {
    if (!content.trim() || !selectedFriend || !currentUserId) return;

    try {
      const { error } = await supabase
        .from<'messages'>('messages')
        .insert({
          content,
          sender_id: currentUserId,
          receiver_id: selectedFriend.friend_id
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje",
      });
      return false;
    }
  };

  return { messages, loadMessages, sendMessage };
}
