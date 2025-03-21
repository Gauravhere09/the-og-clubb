
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/lib/utils";

interface FriendRequestData {
  id: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  mutual_friends?: {
    username: string;
    avatar_url: string | null;
  }[];
}

interface RequestsSectionProps {
  receivedRequests: FriendRequestData[];
  handleRequest: (requestId: string, accept: boolean) => Promise<void>;
}

export function RequestsSection({ receivedRequests, handleRequest }: RequestsSectionProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Solicitudes de amistad</h2>
        {receivedRequests.length > 5 && (
          <Link to="/friends/requests" className="text-sm text-primary flex items-center">
            Ver todo
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow">
        {receivedRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-3">
            No tienes solicitudes de amistad pendientes
          </p>
        ) : (
          <div className="space-y-3">
            {receivedRequests.map((request) => (
              <div key={request.id} className="flex items-start py-2">
                <Avatar className="h-14 w-14 mr-3">
                  <AvatarImage src={request.sender.avatar_url || undefined} />
                  <AvatarFallback>{request.sender.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium truncate">{request.sender.username}</h3>
                      {request.mutual_friends && request.mutual_friends.length > 0 && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <div className="flex -space-x-2 mr-1">
                            {request.mutual_friends.slice(0, 2).map((friend, index) => (
                              <Avatar key={index} className="h-4 w-4 border border-background">
                                <AvatarImage src={friend.avatar_url || undefined} />
                                <AvatarFallback>{friend.username[0]?.toUpperCase()}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          {request.mutual_friends.length} {request.mutual_friends.length === 1 ? 'amigo' : 'amigos'} en común
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatTimeAgo(request.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => handleRequest(request.id, true)}
                    >
                      Confirmar
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleRequest(request.id, false)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
