
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/FollowButton";
import { Button } from "@/components/ui/button";
import { X, Sparkles, UserPlus, UserCheck } from "lucide-react";
import { FriendSuggestion } from "@/types/friends";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationsSuggestionsProps {
  suggestions: FriendSuggestion[];
  onDismissSuggestion: (userId: string) => void;
  setOpen: (open: boolean) => void;
}

export function NotificationsSuggestions({ 
  suggestions, 
  onDismissSuggestion, 
  setOpen 
}: NotificationsSuggestionsProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [pendingRequests, setPendingRequests] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  if (suggestions.length === 0) return null;
  
  const sendFriendRequest = async (friendId: string) => {
    setLoadingStates(prev => ({ ...prev, [friendId]: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para enviar solicitudes",
          variant: "destructive"
        });
        return;
      }

      // Comprobamos si ya existe una solicitud pendiente
      const { data: existingRequest } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', user.id)
        .eq('friend_id', friendId)
        .single();

      if (existingRequest) {
        toast({
          title: "Ya existe una solicitud",
          description: "Ya has enviado una solicitud a este usuario",
        });
        return;
      }

      // Enviamos la solicitud (status: 'pending')
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Enviamos notificación al usuario
      await supabase
        .from('notifications')
        .insert({
          type: 'friend_request',
          sender_id: user.id,
          receiver_id: friendId,
          read: false
        });

      setPendingRequests(prev => ({ ...prev, [friendId]: true }));
      toast({
        title: "Solicitud enviada",
        description: "Se ha enviado la solicitud de amistad"
      });
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [friendId]: false }));
    }
  };

  return (
    <>
      <div className="p-2 bg-muted/50 text-sm font-medium text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span>Sugerencias para ti</span>
        </div>
      </div>
      
      {suggestions.slice(0, 5).map((suggestion) => (
        <div key={suggestion.id} className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${suggestion.id}`} onClick={() => setOpen(false)}>
              <Avatar>
                <AvatarImage src={suggestion.avatar_url || undefined} />
                <AvatarFallback>{suggestion.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link 
                to={`/profile/${suggestion.id}`}
                className="font-medium hover:underline"
                onClick={() => setOpen(false)}
              >
                {suggestion.username}
              </Link>
              {suggestion.mutual_friends_count > 0 && (
                <div className="text-xs text-muted-foreground">
                  {suggestion.mutual_friends_count} amigos en común
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {pendingRequests[suggestion.id] ? (
              <Button 
                size="sm" 
                variant="outline"
                className="h-8 flex items-center gap-1"
                disabled
              >
                <UserCheck className="h-4 w-4" />
                <span>Enviado</span>
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="default"
                className="h-8 flex items-center gap-1"
                onClick={() => sendFriendRequest(suggestion.id)}
                disabled={loadingStates[suggestion.id]}
              >
                <UserPlus className="h-4 w-4" />
                <span>Añadir</span>
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => onDismissSuggestion(suggestion.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      
      <div className="p-2 text-center">
        <Link 
          to="/friends" 
          className="text-sm text-blue-500 hover:underline"
          onClick={() => setOpen(false)}
        >
          Ver todas las sugerencias
        </Link>
      </div>
    </>
  );
}
