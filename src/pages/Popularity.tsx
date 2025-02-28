
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PopularityLayout } from "@/components/popularity/PopularityLayout";
import { PopularityHeader } from "@/components/popularity/PopularityHeader";
import { PopularityContent } from "@/components/popularity/PopularityContent";
import { LoadingState } from "@/components/popularity/LoadingState";
import { usePopularUsers } from "@/hooks/use-popular-users";

export default function Popularity() {
  const { popularUsers, loading, careerFilters } = usePopularUsers();
  const [filter, setFilter] = useState<string | null>(null);
  const navigate = useNavigate();

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
      <PopularityHeader 
        careerFilters={careerFilters}
        currentFilter={filter}
        onFilterChange={setFilter}
      />
      <PopularityContent 
        users={filteredUsers} 
        onProfileClick={handleProfileClick} 
      />
    </PopularityLayout>
  );
}
