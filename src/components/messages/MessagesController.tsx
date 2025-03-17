
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
import { useNavigate } from "react-router-dom";

export const MessagesController = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [dialogTargetUser, setDialogTargetUser] = useState<{
    id: string;
    username: string;
    avatar_url: string | null;
  } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      setIsAuthChecking(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          console.error("Error checking auth session:", error);
          setIsAuthenticated(false);
          toast({
            variant: "destructive",
            title: "Error de autenticación",
            description: "Debes iniciar sesión para acceder a los mensajes",
          });
          // Redirect to auth page after short delay
          setTimeout(() => navigate("/auth"), 1500);
          return;
        }
        
        if (data.session?.user) {
          setCurrentUserId(data.session.user.id);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error in auth check:", err);
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    loadCurrentUser();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserId(null);
        setIsAuthenticated(false);
        navigate("/auth");
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, toast]);

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
    if (!isAuthenticated || !currentUserId) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Debes iniciar sesión para enviar mensajes",
      });
      return;
    }

    try {
      await sendGroupMessage(currentUserId, content, type, mediaBlob);
    } catch (error) {
      console.error("Error al enviar mensaje grupal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje al grupo",
      });
    }
  };

  // Show loading state while checking authentication
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Comprobando sesión...</span>
      </div>
    );
  }

  // Determine sidebar visibility based on screen size and selection state
  const showSidebar = (!Boolean(selectedFriend) && !showGroupChat) || !isMobile;
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
            onSendGroupMessage={handleSendGroupMessage}
          />
        </div>
      }
    />
  );
};
