
import { FriendRequest } from "@/hooks/use-friends";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserCheck, UserX } from "lucide-react";

interface FriendRequestsListProps {
  requests: FriendRequest[];
  onRespond: (requestId: string, accept: boolean) => Promise<void>;
}

export function FriendRequestsList({ requests, onRespond }: FriendRequestsListProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Solicitudes de amistad</h2>
      {requests.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No tienes solicitudes de amistad pendientes
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={request.user.avatar_url || undefined} />
                  <AvatarFallback>
                    {request.user.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{request.user.username}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onRespond(request.id, true)}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onRespond(request.id, false)}
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
