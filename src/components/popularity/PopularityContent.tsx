
import { useState } from "react";
import { TopUsers } from "@/components/popularity/TopUsers";
import { UserList } from "@/components/popularity/UserList";
import type { PopularUserProfile } from "@/types/database/follow.types";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface PopularityContentProps {
  users: PopularUserProfile[];
  onProfileClick: (userId: string) => void;
}

export const PopularityContent = ({ 
  users, 
  onProfileClick 
}: PopularityContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  // Always show the top 3 users on every page
  const topUsers = users.slice(0, 3);
  
  // Calculate remaining users (excluding top 3)
  const remainingUsers = users.length > 3 ? users.slice(3) : [];
  
  // Calculate pagination
  const totalPages = Math.ceil(remainingUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = remainingUsers.slice(indexOfFirstUser, indexOfLastUser);
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pageNumbers: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of page numbers to show
      let startPage: number;
      let endPage: number;
      
      if (currentPage <= 3) {
        // Show pages 1-4 and then ellipsis and last page
        startPage = 2;
        endPage = 4;
        pageNumbers.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i));
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page, ellipsis, and then last 3 pages
        pageNumbers.push('ellipsis');
        startPage = totalPages - 3;
        endPage = totalPages - 1;
        pageNumbers.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i));
        pageNumbers.push(totalPages);
      } else {
        // Show first page, ellipsis, current page and neighbors, ellipsis, last page
        pageNumbers.push('ellipsis');
        pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the component when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {users.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6">
            <TopUsers users={topUsers} onProfileClick={onProfileClick} />
            
            {remainingUsers.length > 0 ? (
              <UserList users={currentUsers} onProfileClick={onProfileClick} startRank={3 + indexOfFirstUser + 1} />
            ) : null}
          </div>
          
          {/* Only show pagination if we have more than one page */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((page, index) => (
                  page === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => handlePageChange(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No hay usuarios con este filtro. Prueba con otro criterio.
          </p>
        </div>
      )}
    </div>
  );
};
