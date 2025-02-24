
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Friend } from "@/hooks/use-friends";

interface ArchivedChatsProps {
  archivedFriends: Friend[];
  onUnarchive: (friendId: string) => void;
}

export const ArchivedChats = ({ archivedFriends, onUnarchive }: ArchivedChatsProps) => {
  if (archivedFriends.length === 0) return null;

  return (
    <>
      <div className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        Chats archivados
      </div>
      {archivedFriends.map(friend => (
        <div key={friend.friend_id} className="relative">
          <div className="w-full p-4 flex items-center gap-3 bg-gray-100 dark:bg-neutral-900">
            <div className="flex-1">
              <div className="font-medium">{friend.friend_username}</div>
              <div className="text-sm text-gray-500">Archivado</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreVertical className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onUnarchive(friend.friend_id)}>
                  Desarchivar chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </>
  );
};
