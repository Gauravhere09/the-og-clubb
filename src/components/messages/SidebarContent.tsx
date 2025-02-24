
import { Friend } from "@/hooks/use-friends";
import { SearchBar } from "./SearchBar";
import { GroupChatButton } from "./GroupChatButton";
import { FriendList } from "./FriendList";
import { ArchivedChats } from "./ArchivedChats";

interface SidebarContentProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onGroupChatClick: () => void;
  filteredFriends: Friend[];
  selectedFriend: Friend | null;
  onSelectFriend: (friend: Friend) => void;
  onLongPress: (friendId: string) => void;
  onPressEnd: () => void;
  archivedFriends: Friend[];
  onUnarchive: (friendId: string) => void;
}

export const SidebarContent = ({
  searchQuery,
  onSearchChange,
  onGroupChatClick,
  filteredFriends,
  selectedFriend,
  onSelectFriend,
  onLongPress,
  onPressEnd,
  archivedFriends,
  onUnarchive,
}: SidebarContentProps) => {
  return (
    <>
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <div className="overflow-y-auto h-[calc(100%-73px)]">
        <GroupChatButton onClick={onGroupChatClick} />
        <FriendList 
          friends={filteredFriends}
          selectedFriend={selectedFriend}
          onSelectFriend={onSelectFriend}
          onLongPress={onLongPress}
          onPressEnd={onPressEnd}
        />
        <ArchivedChats 
          archivedFriends={archivedFriends}
          onUnarchive={onUnarchive}
        />
      </div>
    </>
  );
};
