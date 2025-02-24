
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Phone, Video, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
}

interface ChatHeaderProps {
  friend: Friend;
  onBack: () => void;
  isTyping?: boolean;
}

export const ChatHeader = ({ friend, onBack, isTyping = false }: ChatHeaderProps) => {
  return (
    <div className="p-3 bg-white dark:bg-[#111B21] border-l border-gray-200 dark:border-[#313D45] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white md:block"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={friend.friend_avatar_url || undefined} />
          <AvatarFallback>{friend.friend_username[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{friend.friend_username}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isTyping ? "escribiendo..." : "en línea"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
