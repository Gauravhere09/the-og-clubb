
import { useState, useEffect } from 'react';
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
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .or(`sender_id.eq.${selectedFriend.friend_id},receiver_id.eq.${selectedFriend.friend_id}`)
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
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: currentUserId,
          receiver_id: selectedFriend.friend_id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setMessages(prev => [...prev, data as Message]);
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

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { messages, loadMessages, sendMessage };
}
