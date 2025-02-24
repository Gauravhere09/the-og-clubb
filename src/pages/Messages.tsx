
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FriendList } from "@/components/messages/FriendList";
import { ChatHeader } from "@/components/messages/ChatHeader";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { GroupChat } from "@/components/messages/GroupChat";
import { useFriends, Friend } from "@/hooks/use-friends";
import { useGroupMessages } from "@/hooks/use-group-messages";
import { usePrivateMessages } from "@/hooks/use-private-messages";
import { useMessageNotifications } from "@/components/messages/MessageNotification";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical } from "lucide-react";

const Messages = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [archivedChats, setArchivedChats] = useState<Set<string>>(new Set());
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const { friends } = useFriends(currentUserId);
  const { messages, loadMessages, sendMessage } = usePrivateMessages();
  const { groupMessages } = useGroupMessages(currentUserId, showGroupChat);
  
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
    }
  }, [currentUserId, selectedFriend]);

  const handleSendMessage = async () => {
    if (currentUserId && selectedFriend) {
      const success = await sendMessage(newMessage, currentUserId, selectedFriend);
      if (success) {
        setNewMessage("");
      }
    }
  };

  const handleChatLongPress = (friendId: string) => {
    const timer = setTimeout(() => {
      setArchivedChats(prev => {
        const newSet = new Set(prev);
        newSet.add(friendId);
        return newSet;
      });
    }, 500);
    setLongPressTimer(timer);
  };

  const handleChatPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleUnarchiveChat = (friendId: string) => {
    setArchivedChats(prev => {
      const newSet = new Set(prev);
      newSet.delete(friendId);
      return newSet;
    });
  };

  const filteredFriends = friends.filter(friend =>
    friend.friend_username.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !archivedChats.has(friend.friend_id)
  );

  const archivedFriends = friends.filter(friend =>
    archivedChats.has(friend.friend_id)
  );

  return (
    <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-white">
      <Navigation />
      <main className="flex-1">
        <div className="h-[calc(100vh-64px)] flex">
          <Card className="w-[380px] rounded-none bg-gray-50 dark:bg-black border-r border-gray-200 dark:border-neutral-800">
            <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar o empezar un nuevo chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none border border-gray-200 dark:border-neutral-800"
                />
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-73px)]">
              <button
                onClick={() => {
                  setShowGroupChat(true);
                  setSelectedFriend(null);
                }}
                className="w-full p-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors border-b border-gray-200 dark:border-neutral-800"
              >
                <div className="w-12 h-12 rounded-full bg-[#9b87f5] dark:bg-black border border-[#7E69AB] dark:border-neutral-800 flex items-center justify-center">
                  <span className="text-lg font-semibold text-white">H</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Red H</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Chat grupal</div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </button>
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
              {archivedFriends.length > 0 && (
                <>
                  <div className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Chats archivados
                  </div>
                  {archivedFriends.map(friend => (
                    <div key={friend.friend_id} className="relative">
                      <div className="w-full p-4 flex items-center gap-3 bg-gray-100 dark:bg-neutral-900">
                        <div className="flex-1">
                          <div className="font-medium">{friend.friend_username}</div>
                          <div className="text-sm text-gray-500">Archivado</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="h-5 w-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleUnarchiveChat(friend.friend_id)}>
                              Desarchivar chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </Card>

          <div className="flex-1 bg-gray-50 dark:bg-black flex flex-col">
            {showGroupChat ? (
              currentUserId && (
                <GroupChat
                  messages={groupMessages}
                  currentUserId={currentUserId}
                  onSendMessage={async (content, type, audioBlob) => {}}
                />
              )
            ) : selectedFriend ? (
              <>
                <ChatHeader friend={selectedFriend} />
                {currentUserId && (
                  <>
                    <MessageList 
                      messages={messages}
                      currentUserId={currentUserId}
                    />
                    <MessageInput 
                      newMessage={newMessage}
                      onMessageChange={setNewMessage}
                      onSendMessage={handleSendMessage}
                    />
                  </>
                )}
              </>
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
