
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
}

interface ChatHeaderProps {
  friend: Friend;
}

export const ChatHeader = ({ friend }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b flex items-center gap-3">
      <Avatar>
        <AvatarImage src={friend.friend_avatar_url || undefined} />
        <AvatarFallback>{friend.friend_username[0]}</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium">{friend.friend_username}</div>
        <div className="text-sm text-muted-foreground">En línea</div>
      </div>
    </div>
  );
};
