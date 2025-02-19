
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

interface Friendship {
  user_id: string;
  friend_id: string;
}

type DatabaseResponseType<T> = {
  data: T;
  error: Error | null;
}

const Messages = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
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
        
        const result = await supabase.rpc('get_user_friendships', { 
          user_id: currentUserId 
        }) as unknown as DatabaseResponseType<Friendship[]>;

        const { data: friendships, error: friendshipsError } = result;

        if (friendshipsError) {
          console.error('Error loading friendships:', friendshipsError);
          return;
        }

        if (!friendships || !Array.isArray(friendships) || friendships.length === 0) {
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
    if (!selectedFriend || !currentUserId) return;

    const loadMessages = async () => {
      try {
        const result = await supabase.rpc('get_conversation_messages', { 
          user1_id: currentUserId,
          user2_id: selectedFriend.friend_id
        }) as unknown as DatabaseResponseType<Message[]>;

        const { data, error } = result;

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

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${currentUserId},receiver_id=eq.${selectedFriend.friend_id}`,
      }, () => {
        loadMessages();
      })
      .subscribe();

    loadMessages();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedFriend, currentUserId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || !currentUserId) return;

    try {
      const result = await supabase.rpc('send_message', {
        content_text: newMessage,
        sender_user_id: currentUserId,
        receiver_user_id: selectedFriend.friend_id
      }) as unknown as DatabaseResponseType<null>;

      const { error } = result;
      
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

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-6xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
        <div className="grid gap-6 md:grid-cols-[1fr,320px]">
          <Card className="grid md:grid-cols-[320px,1fr] h-[calc(100vh-120px)]">
            <FriendList 
              friends={friends}
              selectedFriend={selectedFriend}
              onSelectFriend={setSelectedFriend}
            />

            <div className="flex flex-col">
              {selectedFriend ? (
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
                  Selecciona un amigo para comenzar a chatear
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
