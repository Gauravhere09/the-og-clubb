
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserPlus, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getFriendSuggestions } from "@/lib/api/friends/suggestions";
import { FriendSuggestion } from "@/types/friends";
import { useToast } from "@/hooks/use-toast";

export function PeopleYouMayKnow() {
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedFriends, setRequestedFriends] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const data = await getFriendSuggestions();
        // Limit to 2-4 suggestions for the feed widget
        setSuggestions(data.slice(0, 4));
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

  if (loading || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Personas que quizá conozcas</CardTitle>
          <Link to="/friends" className="text-sm text-primary flex items-center">
            Ver todo <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-3 py-2">
        <div className="grid grid-cols-2 gap-2">
          {suggestions.slice(0, 4).map((suggestion) => (
            <div 
              key={suggestion.id}
              className="relative rounded-lg p-3 border"
            >
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
                  <Link to={`/profile/${suggestion.id}`} className="font-medium text-sm hover:underline">
                    {suggestion.username}
                  </Link>
                  
                  {suggestion.mutual_friends_count > 0 && (
                    <div className="flex items-center justify-center text-xs text-muted-foreground mt-1">
                      <Avatar className="h-4 w-4 mr-1">
                        <AvatarFallback className="text-[8px]">👥</AvatarFallback>
                      </Avatar>
                      {suggestion.mutual_friends_count} {suggestion.mutual_friends_count === 1 ? 'amigo' : 'amigos'} en común
                    </div>
                  )}
                </div>
                
                <Button 
                  variant={requestedFriends[suggestion.id] ? "secondary" : "default"}
                  size="sm" 
                  className="w-full mt-1"
                  disabled={requestedFriends[suggestion.id]}
                  onClick={() => handleSendRequest(suggestion.id)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  {requestedFriends[suggestion.id] ? "Enviada" : "Añadir"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
