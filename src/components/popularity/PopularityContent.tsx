
import { UserList } from "@/components/popularity/UserList";
import { TopUsers } from "@/components/popularity/TopUsers";
import type { PopularUserProfile } from "@/types/database/follow.types";

interface PopularityContentProps {
  users: PopularUserProfile[];
  onProfileClick: (userId: string) => void;
}

export const PopularityContent = ({ users, onProfileClick }: PopularityContentProps) => {
  // Get top 3 users if we have at least 3 users
  const topUsers = users.length >= 3 ? users.slice(0, 3) : [];
  
  // Get the rest of the users starting from the 4th user
  const restOfUsers = users.length > 3 ? users.slice(3) : users;

  return (
    <div className="space-y-8">
      {topUsers.length === 3 && (
        <TopUsers 
          users={topUsers} 
          onProfileClick={onProfileClick} 
        />
      )}
      
      <UserList 
        users={topUsers.length === 3 ? restOfUsers : users} 
        onProfileClick={onProfileClick}
        startRank={topUsers.length === 3 ? 4 : 1}
      />
    </div>
  );
};
