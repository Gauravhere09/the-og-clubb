
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFriends, Friend } from "@/hooks/use-friends";
import { useGroupMessages } from "@/hooks/use-group-messages";
import { usePrivateMessages } from "@/hooks/use-private-messages";
import { useArchivedChats } from "@/hooks/use-archived-chats";
import { useMessageNotifications } from "@/components/messages/MessageNotification";
import { MessagesLayout } from "@/components/messages/MessagesLayout";
import { SidebarContent } from "@/components/messages/SidebarContent";
import { ChatContainer } from "@/components/messages/ChatContainer";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  const { friends } = useFriends(currentUserId);
  const { messages, loadMessages, sendMessage, deleteMessage } = usePrivateMessages();
  const { groupMessages } = useGroupMessages(currentUserId, showGroupChat);
  const { 
    archivedChats, 
    handleChatLongPress, 
    handleChatPressEnd, 
    handleUnarchiveChat 
  } = useArchivedChats();
  
  useMessageNotifications(currentUserId);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId && selectedFriend) {
      loadMessages(currentUserId, selectedFriend);

      const channel = supabase.channel('typing')
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
          if (payload.userId === selectedFriend.friend_id) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUserId, selectedFriend]);

  const handleMessageChange = (message: string) => {
    setNewMessage(message);
    
    if (currentUserId && selectedFriend) {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      const channel = supabase.channel('typing');
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId }
      });

      setTypingTimeout(setTimeout(() => {
        channel.send({
          type: 'broadcast',
          event: 'stop_typing',
          payload: { userId: currentUserId }
        });
      }, 2000));
    }
  };

  const handleSendMessage = async () => {
    if (currentUserId && selectedFriend) {
      const success = await sendMessage(newMessage, currentUserId, selectedFriend);
      if (success) {
        setNewMessage("");
      }
    }
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUserId) return;
    await deleteMessage(messageId, currentUserId);
  };
  
  const handleImageUpload = async (file: File) => {
    if (!currentUserId || !selectedFriend) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;
      const filePath = `message_images/${fileName}`;
      
      // Subir imagen a Storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Obtener URL pública
      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
        
      if (data && data.publicUrl) {
        // Enviar mensaje con imagen
        const messageContent = `[Imagen] ${data.publicUrl}`;
        const success = await sendMessage(messageContent, currentUserId, selectedFriend);
        
        if (success) {
          toast({
            title: "Imagen enviada",
            description: "La imagen se ha enviado correctamente",
          });
        }
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la imagen",
      });
    }
  };

  const handleBack = () => {
    setSelectedFriend(null);
    setShowGroupChat(false);
  };

  const filteredFriends = friends.filter(friend =>
    friend.friend_username.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !archivedChats.has(friend.friend_id)
  );

  const archivedFriends = friends.filter(friend =>
    archivedChats.has(friend.friend_id)
  );

  const showSidebar = (!Boolean(selectedFriend) && !showGroupChat) || window.innerWidth >= 768;
  const showChat = Boolean(selectedFriend) || showGroupChat;

  return (
    <MessagesLayout
      showSidebar={showSidebar}
      sidebar={
        <SidebarContent
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onGroupChatClick={() => {
            setShowGroupChat(true);
            setSelectedFriend(null);
          }}
          filteredFriends={filteredFriends}
          selectedFriend={selectedFriend}
          onSelectFriend={(friend) => {
            setSelectedFriend(friend);
            setShowGroupChat(false);
          }}
          onLongPress={handleChatLongPress}
          onPressEnd={handleChatPressEnd}
          archivedFriends={archivedFriends}
          onUnarchive={handleUnarchiveChat}
        />
      }
      content={
        <div className={`flex-1 bg-gray-50 dark:bg-black flex flex-col ${!showSidebar ? 'fixed inset-0 z-50' : ''}`}>
          <ChatContainer
            showChat={showChat}
            showGroupChat={showGroupChat}
            selectedFriend={selectedFriend}
            currentUserId={currentUserId}
            messages={messages}
            groupMessages={groupMessages}
            newMessage={newMessage}
            isTyping={isTyping}
            onBack={handleBack}
            onMessageChange={handleMessageChange}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onImageUpload={handleImageUpload}
          />
        </div>
      }
    />
  );
};

export default Messages;
