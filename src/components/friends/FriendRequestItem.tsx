
import { Link } from "react-router-dom";
import { UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface FriendRequestItemProps {
  id: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
}

export function FriendRequestItem({ id, sender, onAccept, onReject }: FriendRequestItemProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg hover:bg-accent gap-3">
      <Link
        to={`/profile/${sender.id}`}
        className="flex items-center gap-3"
      >
        <Avatar>
          <AvatarImage src={sender.avatar_url || undefined} />
          <AvatarFallback>
            {sender.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">
          {sender.username || "Usuario"}
        </span>
      </Link>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          size={isMobile ? "sm" : "default"}
          onClick={() => onAccept(id)}
          className="flex-1 sm:flex-none"
        >
          <UserCheck className="mr-2 h-4 w-4" />
          Aceptar
        </Button>
        <Button
          size={isMobile ? "sm" : "default"}
          variant="secondary"
          onClick={() => onReject(id)}
          className="flex-1 sm:flex-none"
        >
          <UserX className="mr-2 h-4 w-4" />
          Rechazar
        </Button>
      </div>
    </div>
  );
}
