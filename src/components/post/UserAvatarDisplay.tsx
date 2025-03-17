
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarDisplayProps {
  currentUser: { 
    id: string;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

export function UserAvatarDisplay({ currentUser }: UserAvatarDisplayProps) {
  return (
    <Avatar className="h-10 w-10 border-2 border-primary/10">
      <AvatarImage 
        src={currentUser?.avatar_url || undefined} 
        alt={currentUser?.username || "Usuario"}
        onError={(e) => {
          console.log("Error cargando imagen:", e);
          const target = e.target as HTMLImageElement;
          target.style.display = 'none'; // Ocultar imagen en error
        }}
      />
      <AvatarFallback>{currentUser?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
    </Avatar>
  );
}
