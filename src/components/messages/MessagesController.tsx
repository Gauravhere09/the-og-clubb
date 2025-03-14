
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMessages } from "@/hooks/use-messages";
import { useMessageNotifications } from "@/components/messages/MessageNotification";
import { MessagesLayout } from "@/components/messages/MessagesLayout";
import { SidebarContent } from "@/components/messages/SidebarContent";
import { ChatContainer } from "@/components/messages/ChatContainer";
import { ChatDialog } from "@/components/messages/ChatDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { sendGroupMessage } from "@/hooks/use-group-messages";
import { useToast } from "@/hooks/use-toast";

export const MessagesController = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [dialogTargetUser, setDialogTargetUser] = useState<{
    id: string;
    username: string;
    avatar_url: string | null;
  } | null>(null);
  
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    loadCurrentUser();
  }, []);

  // Set up message notifications
  useMessageNotifications(currentUserId);

  // Use the messages hook for state management
  const {
    selectedFriend,
    setSelectedFriend,
    newMessage,
    showGroupChat,
    setShowGroupChat,
    searchQuery,
    setSearchQuery,
    isTyping,
    messages,
    groupMessages,
    filteredFriends,
    archivedFriends,
    handleChatLongPress,
    handleChatPressEnd,
    handleUnarchiveChat,
    handleMessageChange,
    handleSendMessage,
    handleDeleteMessage,
    handleImageUpload,
    handleBack
  } = useMessages(currentUserId);

  // Handle sending group messages
  const handleSendGroupMessage = async (content: string, type: 'text' | 'audio' | 'image' = 'text', mediaBlob?: Blob) => {
    if (!currentUserId) {
      // Check auth status again to ensure user is logged in
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para enviar mensajes",
        });
        return;
      }
      setCurrentUserId(data.user.id);
    }

    try {
      await sendGroupMessage(currentUserId || "", content, type, mediaBlob);
    } catch (error) {
      console.error("Error al enviar mensaje grupal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje al grupo",
      });
    }
  };

  // Determine sidebar visibility based on screen size and selection state
  const showSidebar = (!Boolean(selectedFriend) && !showGroupChat) || !isMobile;
  const showChat = Boolean(selectedFriend) || showGroupChat;

  return (
    <>
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
              onSendGroupMessage={handleSendGroupMessage}
            />
          </div>
        }
      />
      
      {/* Direct message dialog */}
      {showChatDialog && dialogTargetUser && currentUserId && (
        <ChatDialog
          isOpen={showChatDialog}
          onClose={() => setShowChatDialog(false)}
          targetUser={dialogTargetUser}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
};
