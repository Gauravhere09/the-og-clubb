
import { TopUsers } from "@/components/popularity/TopUsers";
import { UserList } from "@/components/popularity/UserList";
import type { PopularUserProfile } from "@/types/database/follow.types";

interface PopularityContentProps {
  users: PopularUserProfile[];
  onProfileClick: (userId: string) => void;
}

export const PopularityContent = ({ 
  users, 
  onProfileClick 
}: PopularityContentProps) => {
  return (
    <div className="space-y-4">
      {users.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          <TopUsers users={users} onProfileClick={onProfileClick} />
          <UserList users={users} onProfileClick={onProfileClick} />
        </div>
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
