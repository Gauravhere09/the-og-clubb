
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Friend } from './use-friends';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read_at: string | null;
  is_deleted?: boolean; // Make this optional
}

export function usePrivateMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const loadMessages = async (currentUserId: string, selectedFriend: Friend) => {
    if (!selectedFriend || !currentUserId) return;

    try {
      // Improve the query to correctly filter conversations between the two users
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedFriend.friend_id}),and(sender_id.eq.${selectedFriend.friend_id},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data as Message[] || []);
      
      // Marcar mensajes como leídos
      const unreadMessages = data?.filter(msg => 
        msg.receiver_id === currentUserId && 
        msg.sender_id === selectedFriend.friend_id && 
        !msg.read_at
      );
      
      if (unreadMessages && unreadMessages.length > 0) {
        const unreadIds = unreadMessages.map(msg => msg.id);
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadIds);
      }
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
    if (!content.trim() || !selectedFriend || !currentUserId) return false;

    try {
      // Removed the is_deleted field from the insert object
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
  
  const deleteMessage = async (messageId: string, currentUserId: string) => {
    try {
      // Verificar que el mensaje pertenece al usuario actual
      const messageToDelete = messages.find(msg => msg.id === messageId);
      
      if (!messageToDelete) {
        throw new Error("Mensaje no encontrado");
      }
      
      if (messageToDelete.sender_id !== currentUserId) {
        throw new Error("No tienes permiso para eliminar este mensaje");
      }
      
      // Update message content instead of using is_deleted field
      const { error } = await supabase
        .from('messages')
        .update({
          content: "Este mensaje ha sido eliminado"
        })
        .eq('id', messageId);
        
      if (error) throw error;
      
      // Actualizar el estado local
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: "Este mensaje ha sido eliminado" } 
          : msg
      ));
      
      toast({
        title: "Mensaje eliminado",
        description: "El mensaje ha sido eliminado",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el mensaje",
      });
      return false;
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('private-messages-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        // Si se actualiza un mensaje, actualizamos el estado
        const updatedMessage = payload.new as Message;
        setMessages(prev => prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        ));
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { messages, loadMessages, sendMessage, deleteMessage };
}
