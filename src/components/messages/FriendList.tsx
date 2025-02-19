
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
}

interface FriendListProps {
  friends: Friend[];
  selectedFriend: Friend | null;
  onSelectFriend: (friend: Friend) => void;
}

export const FriendList = ({ friends, selectedFriend, onSelectFriend }: FriendListProps) => {
  return (
    <div className="border-r">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar mensajes" className="pl-9" />
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-73px)]">
        {friends.map((friend) => (
          <button
            key={friend.friend_id}
            className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b ${
              selectedFriend?.friend_id === friend.friend_id ? 'bg-muted' : ''
            }`}
            onClick={() => onSelectFriend(friend)}
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
