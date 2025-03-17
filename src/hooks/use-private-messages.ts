
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
      console.log("Loading messages between", currentUserId, "and", selectedFriend.friend_id);
      
      // Improved query to correctly filter conversations between the two users
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedFriend.friend_id}),and(sender_id.eq.${selectedFriend.friend_id},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      console.log("Messages loaded:", data ? data.length : 0);
      setMessages(data as Message[] || []);
      
      // Mark messages as read
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
      console.log("Sending message to", selectedFriend.friend_username);
      
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
      
      console.log("Message sent successfully");
      setMessages(prev => [...prev, data as Message]);

      // After sending a message, make sure to create a friendship entry if it doesn't exist
      await ensureFriendshipExists(currentUserId, selectedFriend);
      
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
  
  const ensureFriendshipExists = async (currentUserId: string, targetUser: Friend) => {
    try {
      // Check if there's already a friendship entry
      const { data: existingFriendship, error: checkError } = await supabase
        .from('friends')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('friend_id', targetUser.friend_id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking friendship:", checkError);
        return;
      }
      
      // If no friendship exists, create one
      if (!existingFriendship) {
        console.log("Creating friendship entry for current user");
        const { error: insertError } = await supabase
          .from('friends')
          .insert({
            user_id: currentUserId,
            friend_id: targetUser.friend_id,
            friend_username: targetUser.friend_username,
            friend_avatar_url: targetUser.friend_avatar_url || null
          });
        
        if (insertError) {
          console.error("Error creating friendship entry:", insertError);
          return;
        }

        // Also create the reverse entry for the other user
        // Get current user's profile info
        const { data: currentUserProfile, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', currentUserId)
          .single();
        
        if (profileError) {
          console.error("Error fetching current user profile:", profileError);
          return;
        }
        
        // Create the reverse friendship entry
        if (currentUserProfile) {
          console.log("Creating reverse friendship entry for the other user");
          await supabase
            .from('friends')
            .insert({
              user_id: targetUser.friend_id,
              friend_id: currentUserId,
              friend_username: currentUserProfile.username,
              friend_avatar_url: currentUserProfile.avatar_url
            });
        }

        console.log("Friendship entries created successfully");
      }
    } catch (error) {
      console.error("Error managing friendship entries:", error);
    }
  };
  
  const deleteMessage = async (messageId: string, currentUserId: string) => {
    try {
      // Verify the message belongs to the current user
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
      
      // Update local state
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
        console.log("New message received via subscription:", newMessage);
        setMessages(prev => [...prev, newMessage]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        // Update the state when a message is updated
        const updatedMessage = payload.new as Message;
        setMessages(prev => prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        ));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { messages, loadMessages, sendMessage, deleteMessage };
}
