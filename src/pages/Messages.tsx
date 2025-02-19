import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FriendSearch } from "@/components/FriendSearch";
import { useToast } from "@/hooks/use-toast";
import { FriendList } from "@/components/messages/FriendList";
import { ChatHeader } from "@/components/messages/ChatHeader";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { GroupChat } from "@/components/messages/GroupChat";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
}

interface GroupMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_username: string;
  sender_avatar_url: string | null;
  created_at: string;
  type: 'text' | 'audio';
  media_url?: string;
}

const Messages = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showGroupChat, setShowGroupChat] = useState(false);
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
    if (!currentUserId) return;
    
    const loadFriends = async () => {
      try {
        console.log('Loading friends for user:', currentUserId);
        
        const { data: friendships, error: friendshipsError } = await supabase
          .rpc<GetUserFriendshipsFunction['Args'], GetUserFriendshipsFunction['Returns']>(
            'get_user_friendships', 
            { user_id: currentUserId }
          );

        if (friendshipsError) {
          console.error('Error loading friendships:', friendshipsError);
          return;
        }

        if (!friendships || friendships.length === 0) {
          console.log('No friendships found');
          setFriends([]);
          return;
        }

        console.log('Friendships found:', friendships);

        const friendIds = friendships.map(friendship => 
          friendship.user_id === currentUserId ? friendship.friend_id : friendship.user_id
        );

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', friendIds);

        if (profilesError) {
          console.error('Error loading profiles:', profilesError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudieron cargar los amigos",
          });
          return;
        }

        if (!profiles) {
          console.log('No profiles found');
          setFriends([]);
          return;
        }

        console.log('Profiles found:', profiles);

        const friendsList = profiles.map(profile => ({
          friend_id: profile.id,
          friend_username: profile.username || '',
          friend_avatar_url: profile.avatar_url
        }));

        setFriends(friendsList);
      } catch (error) {
        console.error('Error loading friends:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los amigos",
        });
      }
    };

    loadFriends();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId || !showGroupChat) return;

    const loadGroupMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('group_messages')
          .select(`
            *,
            profiles:sender_id(username, avatar_url)
          `)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
          const formattedMessages = data.map(message => ({
            id: message.id,
            content: message.content,
            sender_id: message.sender_id,
            sender_username: message.profiles.username,
            sender_avatar_url: message.profiles.avatar_url,
            created_at: message.created_at,
            type: message.type,
            media_url: message.media_url
          }));
          setGroupMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error loading group messages:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los mensajes del grupo",
        });
      }
    };

    loadGroupMessages();

    const subscription = supabase
      .channel('group_messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_messages',
      }, () => {
        loadGroupMessages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId, showGroupChat]);

  const loadMessages = async () => {
    if (!selectedFriend || !currentUserId) return;

    try {
      const { data, error } = await supabase
        .rpc<GetConversationMessagesFunction['Args'], GetConversationMessagesFunction['Returns']>(
          'get_conversation_messages',
          { 
            user1_id: currentUserId,
            user2_id: selectedFriend.friend_id
          }
        );

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los mensajes",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || !currentUserId) return;

    try {
      const { error } = await supabase
        .rpc<SendMessageFunction['Args'], SendMessageFunction['Returns']>(
          'send_message',
          {
            content_text: newMessage,
            sender_user_id: currentUserId,
            receiver_user_id: selectedFriend.friend_id
          }
        );
      
      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje",
      });
    }
  };

  const handleSendGroupMessage = async (content: string, type: 'text' | 'audio', audioBlob?: Blob) => {
    if (!currentUserId) return;

    try {
      let media_url = undefined;

      if (type === 'audio' && audioBlob) {
        const fileName = `${crypto.randomUUID()}.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audio-messages')
          .upload(fileName, audioBlob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('audio-messages')
          .getPublicUrl(fileName);

        media_url = publicUrl;
      }

      const { error } = await supabase
        .from('group_messages')
        .insert({
          content: content,
          sender_id: currentUserId,
          type: type,
          media_url: media_url
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending group message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje",
      });
    }
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
