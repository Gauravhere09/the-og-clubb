
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Friend } from './use-friends';
import { Tables } from "@/types/database";

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

export function usePrivateMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const loadMessages = async (currentUserId: string, selectedFriend: Friend) => {
    if (!selectedFriend || !currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedFriend.friend_id}),and(sender_id.eq.${selectedFriend.friend_id},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data as Message[] || []);
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
        .from('messages')
        .insert({
          content,
          sender_id: currentUserId,
          receiver_id: selectedFriend.friend_id
        });
      
      if (error) throw error;
      await loadMessages(currentUserId, selectedFriend);
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
