
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Heart, Trophy, Medal, PlusCircle } from "lucide-react";
import { FollowButton } from "@/components/FollowButton";
import type { PopularUserProfile } from "@/types/database/follow.types";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface TopUsersProps {
  users: PopularUserProfile[];
  onProfileClick: (userId: string) => void;
}

export const TopUsers = ({ users, onProfileClick }: TopUsersProps) => {
  if (users.length === 0) return null;

  // Tomamos los primeros 3 usuarios
  const topUsers = users.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {topUsers.map((user, index) => {
        // Depuración para verificar datos
        console.log(`Renderizando usuario top ${index + 1}:`, {
          id: user.id,
          nombre: user.username,
          carrera: user.career,
          semestre: user.semester,
          seguidores: user.followers_count
        });
        
        return (
          <Card 
            key={user.id} 
            className={`overflow-hidden ${
              index === 0 ? 'border-amber-500 border-2' : 
              index === 1 ? 'border-gray-400 border-2' : 
              index === 2 ? 'border-amber-700 border-2' : ''
            }`}
          >
            <div className="p-6 relative">
              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center">
                {index === 0 ? (
                  <Trophy className="h-6 w-6" />
                ) : index === 1 ? (
                  <Medal className="h-6 w-6 fill-gray-200" />
                ) : (
                  <Medal className="h-6 w-6 fill-amber-800" />
                )}
              </div>
              
              <div className="flex items-center justify-center mb-4">
                <Avatar 
                  className="h-20 w-20 cursor-pointer border-4 border-background" 
                  onClick={() => onProfileClick(user.id)}
                >
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="text-center mb-4">
                <h3 
                  className="font-semibold text-lg cursor-pointer hover:underline"
                  onClick={() => onProfileClick(user.id)}
                >
                  {user.username || "Usuario"}
                </h3>
                
                <div className="flex flex-wrap justify-center gap-2 mt-2 min-h-[28px]">
                  {user.career && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {user.career}
                    </Badge>
                  )}
                  
                  {user.semester && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Semestre {user.semester}
                    </Badge>
                  )}
                  
                  {(!user.career && !user.semester) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="flex items-center gap-1 cursor-default">
                            <PlusCircle className="h-3 w-3" />
                            Sin info académica
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">Este usuario aún no ha completado su información académica</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center items-center text-lg font-semibold text-primary gap-1 mb-4">
                <Heart className="h-5 w-5 fill-primary text-primary" />
                <span>{user.followers_count} corazones</span>
              </div>
              
              <div className="flex justify-center">
                <FollowButton targetUserId={user.id} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
