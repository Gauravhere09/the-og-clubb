
import { Link } from "react-router-dom";
import { UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent">
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
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onAccept(id)}
        >
          <UserCheck className="mr-2 h-4 w-4" />
          Aceptar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onReject(id)}
        >
          <UserX className="mr-2 h-4 w-4" />
          Rechazar
        </Button>
      </div>
    </div>
  );
}
