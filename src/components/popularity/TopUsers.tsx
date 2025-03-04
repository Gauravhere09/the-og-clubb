
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Trophy, Award, Medal } from "lucide-react";
import type { PopularUserProfile } from "@/types/database/follow.types";

interface TopUsersProps {
  users: PopularUserProfile[];
  onProfileClick: (userId: string) => void;
}

export const TopUsers = ({ users, onProfileClick }: TopUsersProps) => {
  // Make sure we have exactly 3 users for top positions
  if (users.length !== 3) return null;
  
  // Arrange users in correct order: 2nd, 1st, 3rd
  const [silver, gold, bronze] = users;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6 text-center">Top 3 Usuarios Más Populares</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {/* Silver - 2nd Place */}
        <div className="flex flex-col items-center order-1 sm:order-1">
          <div className="relative">
            <Avatar 
              className="h-24 w-24 border-4 border-silver cursor-pointer" 
              onClick={() => onProfileClick(silver.id)}
            >
              <AvatarImage src={silver.avatar_url || undefined} />
              <AvatarFallback className="text-xl">
                {silver.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 bg-silver text-white rounded-full h-8 w-8 flex items-center justify-center">
              <Award className="h-5 w-5 fill-white" />
            </div>
          </div>
          <h3 
            className="font-semibold mt-3 cursor-pointer hover:underline"
            onClick={() => onProfileClick(silver.id)}
          >
            {silver.username || "Usuario"}
          </h3>
          <p className="text-sm text-muted-foreground">Plata - 2° Lugar</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span>{silver.followers_count}</span>
          </div>
          {silver.career && (
            <span className="mt-1 text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
              {silver.career}
            </span>
          )}
        </div>
        
        {/* Gold - 1st Place */}
        <div className="flex flex-col items-center order-0 sm:order-2">
          <div className="relative">
            <Avatar 
              className="h-32 w-32 border-4 border-gold cursor-pointer" 
              onClick={() => onProfileClick(gold.id)}
            >
              <AvatarImage src={gold.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {gold.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 bg-gold text-white rounded-full h-10 w-10 flex items-center justify-center">
              <Trophy className="h-6 w-6 fill-white" />
            </div>
          </div>
          <h3 
            className="font-semibold text-lg mt-3 cursor-pointer hover:underline"
            onClick={() => onProfileClick(gold.id)}
          >
            {gold.username || "Usuario"}
          </h3>
          <p className="text-sm font-bold text-gold">Oro - 1° Lugar</p>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span>{gold.followers_count}</span>
          </div>
          {gold.career && (
            <span className="mt-1 text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
              {gold.career}
            </span>
          )}
        </div>
        
        {/* Bronze - 3rd Place */}
        <div className="flex flex-col items-center order-2 sm:order-3">
          <div className="relative">
            <Avatar 
              className="h-24 w-24 border-4 border-bronze cursor-pointer" 
              onClick={() => onProfileClick(bronze.id)}
            >
              <AvatarImage src={bronze.avatar_url || undefined} />
              <AvatarFallback className="text-xl">
                {bronze.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 bg-bronze text-white rounded-full h-8 w-8 flex items-center justify-center">
              <Medal className="h-5 w-5 fill-white" />
            </div>
          </div>
          <h3 
            className="font-semibold mt-3 cursor-pointer hover:underline"
            onClick={() => onProfileClick(bronze.id)}
          >
            {bronze.username || "Usuario"}
          </h3>
          <p className="text-sm text-muted-foreground">Bronce - 3° Lugar</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span>{bronze.followers_count}</span>
          </div>
          {bronze.career && (
            <span className="mt-1 text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
              {bronze.career}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
