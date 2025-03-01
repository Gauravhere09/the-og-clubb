
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

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
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
};
