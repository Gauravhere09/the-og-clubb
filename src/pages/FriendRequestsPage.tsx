
import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { UserPlus, User, Users, ChevronRight, UserCheck, Clock } from "lucide-react";
import { useFriends } from "@/hooks/use-friends";
import { supabase } from "@/integrations/supabase/client";
import { FriendSuggestion } from "@/types/friends";
import { useIsMobile } from "@/hooks/use-mobile";

const FriendRequestsPage = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("requests");
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();

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
    friends,
    pendingRequests,
    sentRequests,
    suggestions,
    loading,
    handleFriendRequest,
    dismissSuggestion,
    cancelSentRequest
  } = useFriends(currentUserId);

  const handleAccept = async (requestId: string, senderId: string) => {
    setLoadingStates(prev => ({ ...prev, [requestId]: true }));
    await handleFriendRequest(requestId, senderId, true);
    setLoadingStates(prev => ({ ...prev, [requestId]: false }));
  };

  const handleReject = async (requestId: string, senderId: string) => {
    setLoadingStates(prev => ({ ...prev, [requestId]: true }));
    await handleFriendRequest(requestId, senderId, false);
    setLoadingStates(prev => ({ ...prev, [requestId]: false }));
  };

  const handleCancelRequest = async (requestId: string) => {
    setLoadingStates(prev => ({ ...prev, [requestId]: true }));
    await cancelSentRequest(requestId);
    setLoadingStates(prev => ({ ...prev, [requestId]: false }));
  };

  const renderPendingRequests = () => {
    if (loading) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Cargando solicitudes...</p>
        </div>
      );
    }

    if (!pendingRequests.length) {
      return (
        <div className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <UserPlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No hay solicitudes pendientes</h3>
          <p className="text-muted-foreground mt-1">
            Cuando alguien te envíe una solicitud de amistad, aparecerá aquí
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {pendingRequests.map(request => (
          <div key={request.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Link to={`/profile/${request.user_id}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.user.avatar_url || undefined} />
                  <AvatarFallback>{request.user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link to={`/profile/${request.user_id}`} className="font-medium hover:underline">
                  {request.user.username}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Hace {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button
                onClick={() => handleAccept(request.id, request.user_id)}
                disabled={loadingStates[request.id]}
                size={isMobile ? "sm" : "default"}
                className="w-full sm:w-auto"
              >
                Confirmar
              </Button>
              <Button
                onClick={() => handleReject(request.id, request.user_id)}
                disabled={loadingStates[request.id]}
                variant="outline"
                size={isMobile ? "sm" : "default"}
                className="w-full sm:w-auto"
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSentRequests = () => {
    if (loading) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Cargando solicitudes enviadas...</p>
        </div>
      );
    }

    if (!sentRequests.length) {
      return (
        <div className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No hay solicitudes enviadas</h3>
          <p className="text-muted-foreground mt-1">
            Cuando envíes una solicitud de amistad, aparecerá aquí
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {sentRequests.map(request => (
          <div key={request.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Link to={`/profile/${request.friend_id}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.user.avatar_url || undefined} />
                  <AvatarFallback>{request.user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link to={`/profile/${request.friend_id}`} className="font-medium hover:underline">
                  {request.user.username}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Enviada el {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleCancelRequest(request.id)}
              disabled={loadingStates[request.id]}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="sm:ml-auto"
            >
              Cancelar
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const renderAllFriends = () => {
    if (loading) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Cargando amigos...</p>
        </div>
      );
    }

    if (!friends.length) {
      return (
        <div className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No tienes amigos todavía</h3>
          <p className="text-muted-foreground mt-1">
            Cuando aceptes solicitudes o te acepten, tus amigos aparecerán aquí
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {friends.map(friend => (
          <div key={friend.friend_id} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to={`/profile/${friend.friend_id}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={friend.friend_avatar_url || undefined} />
                  <AvatarFallback>{friend.friend_username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link to={`/profile/${friend.friend_id}`} className="font-medium hover:underline">
                  {friend.friend_username}
                </Link>
                {friend.mutual_friends_count > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {friend.mutual_friends_count} amigos en común
                  </p>
                )}
              </div>
            </div>
            <Link to={`/profile/${friend.friend_id}`}>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    );
  };

  const renderSuggestions = () => {
    if (loading) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Cargando sugerencias...</p>
        </div>
      );
    }

    if (!suggestions.length) {
      return (
        <div className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No hay sugerencias disponibles</h3>
          <p className="text-muted-foreground mt-1">
            Vuelve más tarde para ver nuevas sugerencias de amistad
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {suggestions.map(suggestion => (
          <Card key={suggestion.id} className="overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Link to={`/profile/${suggestion.id}`}>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={suggestion.avatar_url || undefined} />
                      <AvatarFallback>{suggestion.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link to={`/profile/${suggestion.id}`} className="font-medium hover:underline">
                      {suggestion.username}
                    </Link>
                    {suggestion.mutual_friends_count > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {suggestion.mutual_friends_count} amigos en común
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={() => {
                    setLoadingStates(prev => ({ ...prev, [suggestion.id]: true }));
                    const sendRequest = async () => {
                      try {
                        await useFriends(currentUserId).followUser(suggestion.id);
                        dismissSuggestion(suggestion.id);
                      } finally {
                        setLoadingStates(prev => ({ ...prev, [suggestion.id]: false }));
                      }
                    };
                    sendRequest();
                  }}
                  disabled={loadingStates[suggestion.id]}
                  className="w-full"
                  size={isMobile ? "sm" : "default"}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Añadir
                </Button>
                <Button
                  onClick={() => dismissSuggestion(suggestion.id)}
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navigation />
      <main className="md:ml-[70px] pt-4 md:pt-8">
        <div className="container px-2 sm:px-4 max-w-4xl">
          <div className="flex items-center mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold">Solicitudes de amistad</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full overflow-x-auto scrollbar-hide flex whitespace-nowrap">
              <TabsTrigger value="requests" className="flex items-center">
                <UserCheck className="mr-2 h-4 w-4" />
                <span>Solicitudes</span>
                {pendingRequests.length > 0 && (
                  <Badge className="ml-2" variant="secondary">{pendingRequests.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>Enviadas</span>
                {sentRequests.length > 0 && (
                  <Badge className="ml-2" variant="secondary">{sentRequests.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>Mis amigos</span>
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Sugerencias</span>
              </TabsTrigger>
            </TabsList>
            
            <Card>
              <TabsContent value="requests" className="m-0">
                {renderPendingRequests()}
              </TabsContent>
              
              <TabsContent value="sent" className="m-0">
                {renderSentRequests()}
              </TabsContent>

              <TabsContent value="friends" className="m-0">
                {renderAllFriends()}
              </TabsContent>
              
              <TabsContent value="suggestions" className="m-0">
                {renderSuggestions()}
              </TabsContent>
            </Card>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default FriendRequestsPage;
