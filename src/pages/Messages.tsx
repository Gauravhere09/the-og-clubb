import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FriendList } from "@/components/messages/FriendList";
import { ChatHeader } from "@/components/messages/ChatHeader";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { GroupChat } from "@/components/messages/GroupChat";
import { SearchBar } from "@/components/messages/SearchBar";
import { ArchivedChats } from "@/components/messages/ArchivedChats";
import { GroupChatButton } from "@/components/messages/GroupChatButton";
import { useFriends, Friend } from "@/hooks/use-friends";
import { useGroupMessages } from "@/hooks/use-group-messages";
import { usePrivateMessages } from "@/hooks/use-private-messages";
import { useArchivedChats } from "@/hooks/use-archived-chats";
import { useMessageNotifications } from "@/components/messages/MessageNotification";

const Messages = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const { friends } = useFriends(currentUserId);
  const { messages, loadMessages, sendMessage } = usePrivateMessages();
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

  const showSidebar = (!selectedFriend && !showGroupChat) || window.innerWidth >= 768;
  const showChat = selectedFriend || showGroupChat;

  return (
    <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-white">
      <Navigation />
      <main className="flex-1">
        <div className="h-[calc(100vh-64px)] flex">
          {showSidebar && (
            <Card className="w-full md:w-[380px] md:block rounded-none bg-gray-50 dark:bg-black border-r border-gray-200 dark:border-neutral-800">
              <SearchBar 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
              <div className="overflow-y-auto h-[calc(100%-73px)]">
                <GroupChatButton 
                  onClick={() => {
                    setShowGroupChat(true);
                    setSelectedFriend(null);
                  }}
                />
                <FriendList 
                  friends={filteredFriends}
                  selectedFriend={selectedFriend}
                  onSelectFriend={(friend) => {
                    setSelectedFriend(friend);
                    setShowGroupChat(false);
                  }}
                  onLongPress={handleChatLongPress}
                  onPressEnd={handleChatPressEnd}
                />
                <ArchivedChats 
                  archivedFriends={archivedFriends}
                  onUnarchive={handleUnarchiveChat}
                />
              </div>
            </Card>
          )}

          <div className={`flex-1 bg-gray-50 dark:bg-black flex flex-col ${!showSidebar ? 'fixed inset-0 z-50' : ''}`}>
            {showChat ? (
              showGroupChat ? (
                currentUserId && (
                  <GroupChat
                    messages={groupMessages}
                    currentUserId={currentUserId}
                    onSendMessage={async (content, type, audioBlob) => {}}
                    onClose={() => {
                      setShowGroupChat(false);
                      const nav = document.querySelector('nav');
                      if (nav) nav.style.display = 'flex';
                    }}
                  />
                )
              ) : selectedFriend ? (
                <>
                  <ChatHeader 
                    friend={selectedFriend} 
                    onBack={() => {
                      setSelectedFriend(null);
                      const nav = document.querySelector('nav');
                      if (nav) nav.style.display = 'flex';
                    }}
                    isTyping={isTyping}
                  />
                  {currentUserId && (
                    <>
                      <MessageList 
                        messages={messages}
                        currentUserId={currentUserId}
                      />
                      <MessageInput 
                        newMessage={newMessage}
                        onMessageChange={handleMessageChange}
                        onSendMessage={handleSendMessage}
                      />
                    </>
                  )}
                </>
              ) : null
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                Selecciona un chat para comenzar
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
