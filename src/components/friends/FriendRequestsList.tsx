
import { FriendRequest } from "@/hooks/use-friends";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserCheck, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface FriendRequestsListProps {
  requests: FriendRequest[];
  onRespond: (requestId: string, accept: boolean) => Promise<void>;
}

export function FriendRequestsList({ requests, onRespond }: FriendRequestsListProps) {
  const isMobile = useIsMobile();
  
  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Solicitudes de amistad</h2>
      {requests.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No tienes solicitudes de amistad pendientes
        </p>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 rounded-lg hover:bg-accent gap-3"
            >
              <Link
                to={`/profile/${request.user_id}`}
                className="flex items-center gap-3"
              >
                <Avatar>
                  <AvatarImage src={request.user.avatar_url || undefined} />
                  <AvatarFallback>
                    {request.user.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="font-medium">{request.user.username}</div>
              </Link>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  size={isMobile ? "sm" : "default"}
                  onClick={() => onRespond(request.id, true)}
                  className="flex-1 sm:flex-none"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Confirmar
                </Button>
                <Button
                  size={isMobile ? "sm" : "default"}
                  variant="secondary"
                  onClick={() => onRespond(request.id, false)}
                  className="flex-1 sm:flex-none"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
