
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserPlus, ChevronRight, Users, X, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getFriendSuggestions } from "@/lib/api/friends/suggestions";
import { FriendSuggestion } from "@/types/friends";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PeopleYouMayKnow() {
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedFriends, setRequestedFriends] = useState<Record<string, boolean>>({});
  const [dismissedFriends, setDismissedFriends] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const data = await getFriendSuggestions();
        // Limit to suggestions for the feed widget
        setSuggestions(data.slice(0, 4)); // Show only 4 suggestions to match the image
      } catch (error) {
        console.error("Error fetching friend suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleSendRequest = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para enviar solicitudes de amistad",
          variant: "destructive",
        });
        return;
      }

      // Send friend request
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      // Create notification for the recipient
      await supabase
        .from('notifications')
        .insert({
          type: 'friend_request',
          sender_id: user.id,
          receiver_id: friendId
        });

      // Update local state
      setRequestedFriends(prev => ({
        ...prev,
        [friendId]: true
      }));

      toast({
        title: "Solicitud enviada",
        description: "Se ha enviado la solicitud de amistad",
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = (friendId: string) => {
    setDismissedFriends(prev => ({
      ...prev, 
      [friendId]: true
    }));
  };

  // Filter out dismissed suggestions
  const visibleSuggestions = suggestions.filter(
    sugg => !dismissedFriends[sugg.id]
  );

  // Si está cargando, mostrar un esqueleto de carga en lugar de no mostrar nada
  if (loading) {
    return (
      <Card className="mb-4 overflow-hidden shadow-md">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Personas que quizá conozcas</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link to="/friends" className="flex items-center w-full">
                    Ver todo
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="px-2 py-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative rounded-lg p-3 animate-pulse">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="h-16 w-16 rounded-full bg-muted"></div>
                  <div className="h-4 w-20 bg-muted rounded"></div>
                  <div className="h-3 w-16 bg-muted rounded"></div>
                  <div className="h-8 w-full bg-muted rounded mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No mostrar el componente si no hay sugerencias visibles
  if (visibleSuggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4 overflow-hidden shadow-md border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Personas que quizá conozcas</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link to="/friends" className="flex items-center w-full">
                  Ver todo
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="px-2 py-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {visibleSuggestions.slice(0, 4).map((suggestion) => (
            <div 
              key={suggestion.id}
              className="relative rounded-lg p-3 hover:bg-muted/30 transition-colors"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full bg-gray-200 dark:bg-gray-700 opacity-70 hover:opacity-100 z-10"
                onClick={() => handleDismiss(suggestion.id)}
              >
                <X className="h-3 w-3" />
              </Button>
              
              <div className="flex flex-col items-center text-center gap-2">
                <Link to={`/profile/${suggestion.id}`}>
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={suggestion.avatar_url || undefined} />
                    <AvatarFallback>
                      {suggestion.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link to={`/profile/${suggestion.id}`} className="font-medium text-sm hover:underline line-clamp-1">
                    {suggestion.username}
                  </Link>
                  
                  {suggestion.mutual_friends_count > 0 && (
                    <div className="flex items-center justify-center text-xs text-muted-foreground mt-1">
                      <span className="line-clamp-1">
                        {suggestion.mutual_friends_count} {suggestion.mutual_friends_count === 1 ? 'amigo' : 'amigos'} en común
                      </span>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant={requestedFriends[suggestion.id] ? "secondary" : "primary"}
                  size="sm" 
                  className="w-full mt-1"
                  disabled={requestedFriends[suggestion.id]}
                  onClick={() => handleSendRequest(suggestion.id)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  {requestedFriends[suggestion.id] ? "Enviada" : "Añadir amigo"}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <Link to="/friends" className="text-sm text-primary hover:underline">
            Ver todo
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
