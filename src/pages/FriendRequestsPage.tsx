import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { FriendRequestItem } from "@/components/friends/FriendRequestItem";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, UserCheck, Clock, MoreVertical } from "lucide-react";
import { useFriends } from "@/hooks/use-friends";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimeAgo } from "@/lib/utils";

const FriendRequestsPage = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"pending" | "sent">("pending");
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    loadCurrentUser();
  }, []);

  const {
    pendingRequests,
    sentRequests,
    loading,
    handleFriendRequest,
    cancelSentRequest
  } = useFriends(currentUserId);

  const handleAccept = async (requestId: string) => {
    setLoadingStates(prev => ({ ...prev, [requestId]: true }));
    await handleFriendRequest(requestId, pendingRequests.find(r => r.id === requestId)?.user_id || "", true);
    setLoadingStates(prev => ({ ...prev, [requestId]: false }));
  };

  const handleReject = async (requestId: string) => {
    setLoadingStates(prev => ({ ...prev, [requestId]: true }));
    await handleFriendRequest(requestId, pendingRequests.find(r => r.id === requestId)?.user_id || "", false);
    setLoadingStates(prev => ({ ...prev, [requestId]: false }));
  };

  const handleCancelRequest = async (requestId: string) => {
    setLoadingStates(prev => ({ ...prev, [requestId]: true }));
    await cancelSentRequest(requestId);
    setLoadingStates(prev => ({ ...prev, [requestId]: false }));
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="fixed top-0 left-0 right-0 z-10 bg-background border-b p-2 flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Solicitudes de amistad</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setActiveView("pending")}>
              Ver solicitudes recibidas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveView("sent")}>
              Ver solicitudes enviadas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <main className="pt-14 px-2 sm:px-4 md:ml-[70px]">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">
              {activeView === "pending" ? "Solicitudes de amistad" : "Solicitudes enviadas"}
            </h2>
          </div>
          
          {loading ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">Cargando solicitudes...</p>
            </div>
          ) : (
            <>
              {activeView === "pending" ? (
                <>
                  {pendingRequests.length === 0 ? (
                    <div className="text-center p-6 bg-card rounded-lg">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <UserCheck className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No hay solicitudes pendientes</h3>
                      <p className="text-muted-foreground mt-1">
                        Cuando alguien te envíe una solicitud de amistad, aparecerá aquí
                      </p>
                    </div>
                  ) : (
                    <div className="bg-card rounded-lg overflow-hidden">
                      {pendingRequests.map(request => (
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
                  )}
                  
                  {pendingRequests.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <Button 
                        variant="ghost" 
                        className="w-full flex items-center justify-center gap-2 p-4"
                        onClick={() => setActiveView("sent")}
                      >
                        <Clock className="h-4 w-4" />
                        Ver solicitudes enviadas
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {sentRequests.length === 0 ? (
                    <div className="text-center p-6 bg-card rounded-lg">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Clock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No hay solicitudes enviadas</h3>
                      <p className="text-muted-foreground mt-1">
                        Cuando envíes una solicitud de amistad, aparecerá aquí
                      </p>
                    </div>
                  ) : (
                    <div className="bg-card rounded-lg overflow-hidden">
                      {sentRequests.map(request => (
                        <div key={request.id} className="p-4 border-b last:border-0">
                          <div className="flex items-center space-x-3">
                            <Link to={`/profile/${request.friend_id}`} className="flex-shrink-0">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={request.user.avatar_url || undefined} />
                                <AvatarFallback>{request.user.username[0].toUpperCase()}</AvatarFallback>
                              </Avatar>
                            </Link>
                            <div className="flex-1">
                              <Link to={`/profile/${request.friend_id}`} className="font-medium hover:underline">
                                {request.user.username}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                Enviada {formatTimeAgo(request.created_at)}
                              </p>
                            </div>
                            <Button
                              onClick={() => handleCancelRequest(request.id)}
                              disabled={loadingStates[request.id]}
                              variant="outline"
                              size="sm"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default FriendRequestsPage;
