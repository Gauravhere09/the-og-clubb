
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart } from "lucide-react";
import type { PopularUserProfile } from "@/types/database/follow.types";

interface UserListProps {
  users: PopularUserProfile[];
  onProfileClick: (userId: string) => void;
}

export const UserList = ({ users, onProfileClick }: UserListProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-4 px-2 grid grid-cols-12 gap-2">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Usuario</div>
          <div className="col-span-3">Carrera</div>
          <div className="col-span-2">Semestre</div>
          <div className="col-span-2 text-right">Corazones</div>
        </div>
        <div className="space-y-2">
          {users.slice(3).map((user, index) => (
            <div 
              key={user.id} 
              className="p-2 hover:bg-muted/50 rounded-md grid grid-cols-12 gap-2 items-center"
            >
              <div className="col-span-1 font-medium text-muted-foreground">
                {index + 4}
              </div>
              <div className="col-span-4">
                <div className="flex items-center space-x-3">
                  <Avatar 
                    className="h-8 w-8 cursor-pointer" 
                    onClick={() => onProfileClick(user.id)}
                  >
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div 
                    className="font-medium cursor-pointer hover:underline"
                    onClick={() => onProfileClick(user.id)}
                  >
                    {user.username || "Usuario"}
                  </div>
                </div>
              </div>
              <div className="col-span-3 truncate">
                {user.career || "-"}
              </div>
              <div className="col-span-2">
                {user.semester ? `Semestre ${user.semester}` : "-"}
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1">
                <Heart className="h-4 w-4 text-primary fill-primary" />
                <span className="font-semibold">{user.followers_count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
