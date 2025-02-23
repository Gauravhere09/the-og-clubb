
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="p-3 bg-[#1F2C33] border-l border-[#313D45] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={friend.friend_avatar_url || undefined} />
          <AvatarFallback>{friend.friend_username[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-white">{friend.friend_username}</div>
          <div className="text-sm text-gray-400">en línea</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
