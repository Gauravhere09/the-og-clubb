
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FriendSearch } from "@/components/FriendSearch";
import { FriendList } from "@/components/messages/FriendList";
import { ChatHeader } from "@/components/messages/ChatHeader";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { GroupChat } from "@/components/messages/GroupChat";
import { useFriends, Friend } from "@/hooks/use-friends";
import { useGroupMessages, sendGroupMessage } from "@/hooks/use-group-messages";
import { usePrivateMessages } from "@/hooks/use-private-messages";

const Messages = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showGroupChat, setShowGroupChat] = useState(false);

  const { friends } = useFriends(currentUserId);
  const { messages, loadMessages, sendMessage } = usePrivateMessages();
  const { groupMessages } = useGroupMessages(currentUserId, showGroupChat);

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

  const handleSendGroupMessage = async (content: string, type: 'text' | 'audio', audioBlob?: Blob) => {
    await sendGroupMessage(currentUserId, content, type, audioBlob);
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-6xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
        <div className="grid gap-6 md:grid-cols-[1fr,320px]">
          <Card className="grid md:grid-cols-[320px,1fr] h-[calc(100vh-120px)]">
            <div className="border-r">
              <button
                onClick={() => {
                  setShowGroupChat(true);
                  setSelectedFriend(null);
                }}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b"
              >
                <div className="font-medium">Chat grupal "h"</div>
              </button>
              <FriendList 
                friends={friends}
                selectedFriend={selectedFriend}
                onSelectFriend={(friend) => {
                  setSelectedFriend(friend);
                  setShowGroupChat(false);
                }}
              />
            </div>

            <div className="flex flex-col">
              {showGroupChat ? (
                currentUserId && (
                  <GroupChat
                    messages={groupMessages}
                    currentUserId={currentUserId}
                    onSendMessage={handleSendGroupMessage}
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
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Selecciona un chat para comenzar
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <FriendSearch />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
