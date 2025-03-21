
import { FriendRequest } from "@/hooks/use-friends";
import { Card } from "@/components/ui/card";
import { FriendRequestItem } from "./FriendRequestItem";
import { Link } from "react-router-dom";
import { ChevronRight, UserCheck } from "lucide-react";

interface FriendRequestsListProps {
  requests: FriendRequest[];
  onRespond: (requestId: string, accept: boolean) => Promise<void>;
  showViewAllLink?: boolean;
}

export function FriendRequestsList({ requests, onRespond, showViewAllLink = false }: FriendRequestsListProps) {
  const handleAccept = async (requestId: string) => {
    await onRespond(requestId, true);
  };
  
  const handleReject = async (requestId: string) => {
    await onRespond(requestId, false);
  };
  
  if (requests.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <UserCheck className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No tienes solicitudes de amistad pendientes</h3>
          <p className="text-muted-foreground mt-1">
            Cuando alguien te envíe una solicitud, aparecerá aquí
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b">
        <h2 className="text-lg font-semibold">Solicitudes de amistad</h2>
        {showViewAllLink && requests.length > 3 && (
          <Link to="/friends/requests" className="text-primary hover:underline text-sm">
            Ver todo
          </Link>
        )}
      </div>
      
      <div>
        {requests.map((request) => (
          <FriendRequestItem
            key={request.id}
            id={request.id}
            sender={{
              id: request.user_id,
              username: request.user.username,
              avatar_url: request.user.avatar_url
            }}
            created_at={request.created_at}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        ))}
      </div>
      
      {showViewAllLink && (
        <Link 
          to="/friends/requests"
          className="flex items-center justify-center gap-2 p-4 text-primary border-t hover:bg-accent transition-colors"
        >
          Ver solicitudes enviadas
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </Card>
  );
}
