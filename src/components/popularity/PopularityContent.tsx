
import { useState } from "react";
import { UserList } from "@/components/popularity/UserList";
import { TopUsers } from "@/components/popularity/TopUsers";
import { Pagination } from "@/components/popularity/Pagination";
import type { PopularUserProfile } from "@/types/database/follow.types";

interface PopularityContentProps {
  users: PopularUserProfile[];
  onProfileClick: (userId: string) => void;
}

export const PopularityContent = ({ users, onProfileClick }: PopularityContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  // Get top 3 users if we have at least 3 users
  const topUsers = users.length >= 3 ? users.slice(0, 3) : [];
  
  // Get the rest of the users starting from the 4th user
  const restOfUsers = users.length > 3 ? users.slice(3) : users;
  
  // Pagination logic
  const totalPages = Math.ceil(restOfUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = restOfUsers.slice(startIndex, startIndex + usersPerPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {topUsers.length === 3 && (
        <TopUsers 
          users={topUsers} 
          onProfileClick={onProfileClick} 
        />
      )}
      
      <UserList 
        users={paginatedUsers}
        onProfileClick={onProfileClick}
        startRank={topUsers.length === 3 ? (startIndex + 4) : (startIndex + 1)}
      />
      
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
