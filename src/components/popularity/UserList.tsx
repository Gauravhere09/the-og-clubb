
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, HelpCircle } from "lucide-react";
import type { PopularUserProfile } from "@/types/database/follow.types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserListProps {
  users: PopularUserProfile[];
  onProfileClick: (userId: string) => void;
}

export const UserList = ({ users, onProfileClick }: UserListProps) => {
  // Filtramos para excluir los 3 primeros usuarios (ya mostrados en TopUsers)
  const remainingUsers = users.length > 3 ? users.slice(3) : [];
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-4 px-2 grid grid-cols-12 gap-2">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Usuario</div>
          <div className="col-span-3">
            <div className="flex items-center">
              Carrera
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 ml-1 text-muted-foreground/70" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">Los usuarios pueden establecer su carrera en la página de edición de perfil</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="col-span-2">
            <div className="flex items-center">
              Semestre
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 ml-1 text-muted-foreground/70" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">Los usuarios pueden establecer su semestre en la página de edición de perfil</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="col-span-2 text-right">Corazones</div>
        </div>
        <div className="space-y-2">
          {remainingUsers.map((user, index) => {
            // Depuración para verificar datos
            console.log(`Renderizando usuario en lista ${index + 4}:`, {
              id: user.id,
              nombre: user.username,
              carrera: user.career,
              semestre: user.semester,
              seguidores: user.followers_count
            });
            
            return (
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
                <div className="col-span-3 truncate text-sm">
                  {user.career ? (
                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">{user.career}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">No especificada</span>
                  )}
                </div>
                <div className="col-span-2 text-sm">
                  {user.semester ? (
                    <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">Semestre {user.semester}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">No especificado</span>
                  )}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <Heart className="h-4 w-4 text-primary fill-primary" />
                  <span className="font-semibold">{user.followers_count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
