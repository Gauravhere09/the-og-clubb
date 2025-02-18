
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendFriendRequest, checkFriendship } from "@/lib/api";

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
    const friendshipStatus = await checkFriendship(targetUserId);
    setStatus(friendshipStatus);
  };

  const handleSendRequest = async () => {
    try {
      setIsLoading(true);
      await sendFriendRequest(targetUserId);
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

  if (status === 'accepted') {
    return (
      <Button variant="secondary" disabled>
        <UserCheck className="mr-2 h-4 w-4" />
        Amigos
      </Button>
    );
  }

  if (status === 'pending') {
    return (
      <Button variant="secondary" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Pendiente
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
