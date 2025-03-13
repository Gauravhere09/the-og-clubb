
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, HelpCircle, Users } from "lucide-react";
import type { PopularUserProfile } from "@/types/database/follow.types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserListProps {
  users: PopularUserProfile[];
  onProfileClick: (userId: string) => void;
  startRank?: number;
}

export const UserList = ({ users, onProfileClick, startRank = 4 }: UserListProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-4 px-2 grid grid-cols-12 gap-2">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Usuario</div>
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
          <div className="col-span-1 text-right">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Users className="h-4 w-4 inline" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">Seguidores</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="col-span-2 text-right">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Heart className="h-4 w-4 inline text-primary" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">Corazones</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="space-y-2">
          {users.map((user, index) => {
            // Forzar los valores a string para depuración y visualización
            const careerValue = typeof user.career === 'string' ? user.career : null;
            const semesterValue = typeof user.semester === 'string' ? user.semester : null;
            
            console.log(`Renderizando usuario en lista ${startRank + index} (datos procesados):`, {
              id: user.id,
              nombre: user.username,
              carrera: careerValue,
              semestre: semesterValue,
              seguidores: user.followers_count,
              corazones: user.hearts_count,
              tipo_carrera: typeof user.career,
              tipo_semestre: typeof user.semester
            });
            
            return (
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
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">{user.followers_count}</span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
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
