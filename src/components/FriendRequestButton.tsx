
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FriendRequestButtonProps {
  targetUserId: string;
  onRequestSent?: () => void;
}

export function FriendRequestButton({ targetUserId, onRequestSent }: FriendRequestButtonProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkFriendshipStatus();
  }, [targetUserId]);

  const checkFriendshipStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('friendships')
        .select('status')
        .or(`user_id.eq.${user.id}.and.friend_id.eq.${targetUserId},user_id.eq.${targetUserId}.and.friend_id.eq.${user.id}`)
        .maybeSingle();

      if (error) throw error;
      setStatus(data?.status || null);
    } catch (error) {
      console.error('Error checking friendship:', error);
    }
  };

  const handleSendRequest = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se encontró usuario");

      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;

      // Crear notificación
      await supabase
        .from('notifications')
        .insert({
          type: 'friend_request',
          sender_id: user.id,
          receiver_id: targetUserId
        });

      setStatus('pending');
      toast({
        title: "Solicitud enviada",
        description: "La solicitud de amistad ha sido enviada correctamente.",
      });
      onRequestSent?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se encontró usuario");

      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`user_id.eq.${user.id}.and.friend_id.eq.${targetUserId},user_id.eq.${targetUserId}.and.friend_id.eq.${user.id}`);

      if (error) throw error;

      setStatus(null);
      toast({
        title: "Solicitud cancelada",
        description: "La solicitud de amistad ha sido cancelada.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'accepted') {
    return (
      <Button variant="secondary" onClick={handleCancelRequest} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserMinus className="mr-2 h-4 w-4" />
        )}
        Eliminar amigo
      </Button>
    );
  }

  if (status === 'pending') {
    return (
      <Button variant="secondary" onClick={handleCancelRequest} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserCheck className="mr-2 h-4 w-4" />
        )}
        Cancelar solicitud
      </Button>
    );
  }

  return (
    <Button onClick={handleSendRequest} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      Agregar amigo
    </Button>
  );
}
