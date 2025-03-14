
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PopularityLayout } from "@/components/popularity/PopularityLayout";
import { PopularityHeader } from "@/components/popularity/PopularityHeader";
import { PopularityContent } from "@/components/popularity/PopularityContent";
import { LoadingState } from "@/components/popularity/LoadingState";
import { usePopularUsers } from "@/hooks/use-popular-users";
import { AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Popularity() {
  const { popularUsers, loading, error, careerFilters } = usePopularUsers();
  const [filter, setFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const filteredUsers = filter 
    ? popularUsers.filter(user => user.career === filter)
    : popularUsers;

  if (loading) {
    return (
      <PopularityLayout>
        <LoadingState />
      </PopularityLayout>
    );
  }

  return (
    <PopularityLayout>
      <div className={`${isMobile ? 'px-2' : 'px-4'}`}>
        <PopularityHeader 
          careerFilters={careerFilters}
          currentFilter={filter}
          onFilterChange={setFilter}
        />
        
        {error ? (
          <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-300">Error al cargar usuarios</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  Por favor, actualiza la página o inténtalo más tarde.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <PopularityContent 
            users={filteredUsers} 
            onProfileClick={handleProfileClick} 
            className={`top-users-grid ${isMobile ? 'grid-cols-1 gap-3' : ''}`}
          />
        )}
      </div>
    </PopularityLayout>
  );
}
