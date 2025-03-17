import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
}

interface FriendListProps {
  friends: Friend[];
  selectedFriend: Friend | null;
  onSelectFriend: (friend: Friend) => void;
  onLongPress?: (friendId: string) => void;
  onPressEnd?: () => void;
}

export const FriendList = ({ 
  friends, 
  selectedFriend, 
  onSelectFriend,
  onLongPress,
  onPressEnd 
}: FriendListProps) => {
  const [lastMessages, setLastMessages] = useState<{[friendId: string]: string}>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  useEffect(() => {
    if (!currentUserId || friends.length === 0) return;
    
    const fetchLastMessages = async () => {
      const friendIds = friends.map(f => f.friend_id);
      
      // Get the most recent message for each conversation
      const messages: {[friendId: string]: string} = {};
      
      for (const friendId of friendIds) {
        // Updated query to use parameterized queries for security
        const { data } = await supabase
          .from('messages')
          .select('content, created_at')
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
          .or(`sender_id.eq.${friendId},receiver_id.eq.${friendId}`)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (data && data.length > 0) {
          const messageContent = data[0].content;
          // Truncate long messages
          messages[friendId] = messageContent.length > 20 ? messageContent.substring(0, 20) + '...' : messageContent;
        }
      }
      
      setLastMessages(messages);
    };
    
    fetchLastMessages();
    
    // Subscribe to new messages to keep the last messages updated
    const channel = supabase
      .channel('friend-list-messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, async (payload) => {
        const message = payload.new as any;
        const otherUserId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
        
        // Update last message display
        if (friends.some(f => f.friend_id === otherUserId)) {
          setLastMessages(prev => ({
            ...prev,
            [otherUserId]: message.content.length > 20 ? message.content.substring(0, 20) + '...' : message.content
          }));
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, friends]);

  return (
    <div className="w-full">
      <ScrollArea className="h-full">
        {friends.map((friend) => (
          <button
            key={friend.friend_id}
            className={`w-full p-4 flex items-center gap-3 hover:bg-[#2A3942] transition-colors border-b border-[#313D45] ${
              selectedFriend?.friend_id === friend.friend_id ? 'bg-[#2A3942]' : ''
            }`}
            onClick={() => onSelectFriend(friend)}
            onMouseDown={() => onLongPress?.(friend.friend_id)}
            onMouseUp={onPressEnd}
            onMouseLeave={onPressEnd}
            onTouchStart={() => onLongPress?.(friend.friend_id)}
            onTouchEnd={onPressEnd}
          >
            <Avatar>
              <AvatarImage src={friend.friend_avatar_url || undefined} />
              <AvatarFallback>{friend.friend_username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="font-medium">{friend.friend_username}</div>
              {lastMessages[friend.friend_id] && (
                <div className="text-sm text-muted-foreground truncate">
                  {lastMessages[friend.friend_id]}
                </div>
              )}
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
};
