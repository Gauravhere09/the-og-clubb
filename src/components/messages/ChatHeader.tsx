
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Phone, Video, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Friend } from "@/hooks/use-friends";

interface ChatHeaderProps {
  selectedFriend: Friend | null;
  isGroupChat: boolean;
  onBack: () => void;
}

export const ChatHeader = ({ selectedFriend, isGroupChat, onBack }: ChatHeaderProps) => {
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
        
        {isGroupChat ? (
          <>
            <div className="w-8 h-8 rounded-full bg-[#9b87f5] dark:bg-black border border-[#7E69AB] dark:border-neutral-800 flex items-center justify-center">
              <span className="text-sm font-semibold text-white">H</span>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Red H</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Chat grupal</div>
            </div>
          </>
        ) : selectedFriend && (
          <>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedFriend.friend_avatar_url || undefined} />
              <AvatarFallback>{selectedFriend.friend_username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{selectedFriend.friend_username}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">en línea</div>
            </div>
          </>
        )}
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
