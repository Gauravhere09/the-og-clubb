
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Award, Medal, Heart } from "lucide-react";
import type { PopularUserProfile } from "@/types/database/follow.types";
import { useIsMobile } from "@/hooks/use-mobile";

interface TopUsersProps {
  users: PopularUserProfile[];
  onProfileClick: (userId: string) => void;
}

export const TopUsers = ({ users, onProfileClick }: TopUsersProps) => {
  const isMobile = useIsMobile();
  
  // Ensure we have exactly 3 users
  if (users.length !== 3) return null;
  
  // Arrange users in the right order for display: 2nd, 1st, 3rd
  const displayOrder = [users[1], users[0], users[2]];
  
  // Get color classes based on position
  const getClasses = (index: number) => {
    switch(index) {
      case 0: return { bg: "bg-silver", text: "text-silver", icon: <Medal className="h-5 w-5 text-silver" /> };
      case 1: return { bg: "bg-gold", text: "text-gold", icon: <Crown className="h-6 w-6 text-gold" /> };
      case 2: return { bg: "bg-bronze", text: "text-bronze", icon: <Award className="h-5 w-5 text-bronze" /> };
      default: return { bg: "", text: "", icon: null };
    }
  };
  
  if (isMobile) {
    // Mobile view - simplified list
    return (
      <div className="space-y-2">
        {displayOrder.map((user, index) => {
          const classes = getClasses(index);
          const ranking = index === 1 ? 1 : index === 0 ? 2 : 3;
          
          return (
            <div 
              key={user.id}
              onClick={() => onProfileClick(user.id)}
              className="p-2 hover:bg-muted/50 rounded-md flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {classes.icon}
                  <span className={`font-semibold ml-1 ${classes.text}`}>#{ranking}</span>
                </div>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{user.username || "Usuario"}</div>
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-red-500 fill-red-500 mr-1" />
                <span className="font-semibold">{user.hearts_count || 0}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  // Desktop view - cards layout
  return (
    <div className="grid grid-cols-3 gap-4 top-users-grid">
      {displayOrder.map((user, index) => {
        const classes = getClasses(index);
        const ranking = index === 1 ? 1 : index === 0 ? 2 : 3;
        
        return (
          <div 
            key={user.id} 
            onClick={() => onProfileClick(user.id)}
            className="relative bg-card rounded-lg shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="absolute top-2 right-2 flex items-center">
              {classes.icon}
              <span className={`font-semibold ml-1 ${classes.text}`}>#{ranking}</span>
            </div>
            
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-28 md:w-28 border-2 border-background">
                <AvatarImage
                  src={user.avatar_url || ""}
                  alt={user.username || ""}
                  className="object-cover"
                />
                <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 right-0 h-7 w-7 rounded-full flex items-center justify-center ${classes.bg}`}>
                {classes.icon}
              </div>
            </div>
            
            <div className="text-center mt-3">
              <h3 className="font-semibold text-base md:text-lg truncate max-w-[120px] md:max-w-[150px]">
                {user.username || "Usuario"}
              </h3>
              <p className="text-muted-foreground text-sm mt-1 truncate max-w-[120px] md:max-w-[150px]">
                {user.career || ""}
              </p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="flex items-center">
                  <span className="text-primary font-medium">{user.followers_count}</span>
                  <span className="text-sm ml-1">seguidores</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 text-red-500 fill-red-500 mr-1" />
                  <span className="font-medium">{user.hearts_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
