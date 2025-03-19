
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart } from "lucide-react";
import type { PopularUserProfile } from "@/types/database/follow.types";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserListProps {
  users: PopularUserProfile[];
  onProfileClick: (userId: string) => void;
  startRank?: number;
}

export const UserList = ({ users, onProfileClick, startRank = 4 }: UserListProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        {!isMobile && (
          <div className="text-sm font-medium text-muted-foreground mb-4 px-2 grid grid-cols-12 gap-2">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Usuario</div>
            <div className="col-span-3">Carrera</div>
            <div className="col-span-2">Semestre</div>
            <div className="col-span-1 text-right">Seguidores</div>
            <div className="col-span-2 text-right">
              <Heart className="h-4 w-4 inline text-primary" />
            </div>
          </div>
        )}

        {isMobile && (
          <div className="text-sm font-semibold mb-2 px-2 grid grid-cols-12 gap-2">
            <div className="col-span-1">#</div>
            <div className="col-span-7">Usuario</div>
            <div className="col-span-4 text-right flex items-center justify-end">
              <Heart className="h-4 w-4 text-red-500 fill-red-500 mr-1" />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {users.map((user, index) => {
            // Forzar los valores a string para depuración y visualización
            const careerValue = typeof user.career === 'string' ? user.career : null;
            const semesterValue = typeof user.semester === 'string' ? user.semester : null;
            
            return isMobile ? (
              // Mobile view - compact
              <div 
                key={user.id} 
                className="p-2 hover:bg-muted/50 rounded-md grid grid-cols-12 gap-2 items-center"
                onClick={() => onProfileClick(user.id)}
              >
                <div className="col-span-1 font-medium text-muted-foreground">
                  {startRank + index}
                </div>
                <div className="col-span-7">
                  <div className="flex items-center space-x-2">
                    <Avatar 
                      className="h-8 w-8 cursor-pointer"
                    >
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium truncate">
                      {user.username || "Usuario"}
                    </div>
                  </div>
                </div>
                <div className="col-span-4 flex items-center justify-end">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 text-red-500 fill-red-500 mr-1" />
                    <span className="font-semibold">{user.hearts_count || 0}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Desktop view - full details
              <div 
                key={user.id} 
                className="p-2 hover:bg-muted/50 rounded-md grid grid-cols-12 gap-2 items-center"
              >
                <div className="col-span-1 font-medium text-muted-foreground">
                  {startRank + index}
                </div>
                <div className="col-span-3">
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
                <div className="col-span-3 truncate text-sm">
                  {careerValue ? (
                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">{careerValue}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">No especificada</span>
                  )}
                </div>
                <div className="col-span-2 text-sm">
                  {semesterValue ? (
                    <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">Semestre {semesterValue}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">No especificado</span>
                  )}
                </div>
                <div className="col-span-1 text-right">
                  <span className="font-semibold">{user.followers_count}</span>
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  <Heart className="h-4 w-4 text-red-500 fill-red-500 mr-1" />
                  <span className="font-semibold">{user.hearts_count || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
