
import { useState } from 'react';
import { 
  sendFriendRequest, 
  unfollowUser,
  acceptFriendRequest, 
  rejectFriendRequest, 
  cancelFriendRequest 
} from "@/lib/api/friends";
import { useToast } from "@/hooks/use-toast";

export function useFriendActions(
  currentUserId: string | null, 
  onUpdate: () => Promise<void>
) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const startLoading = (actionId: string) => {
    setIsLoading(prev => ({ ...prev, [actionId]: true }));
  };

  const stopLoading = (actionId: string) => {
    setIsLoading(prev => ({ ...prev, [actionId]: false }));
  };

  const followUser = async (friendId: string) => {
    if (!currentUserId) return;
    const actionId = `follow_${friendId}`;

    try {
      startLoading(actionId);
      await sendFriendRequest(friendId);
      toast({
        title: "Solicitud enviada",
        description: "Has enviado una solicitud de amistad"
      });
      await onUpdate();
    } catch (error: any) {
      console.error("Error following user:", error);
      toast({
        title: "Error",
        description: error?.message || "No se pudo enviar la solicitud",
        variant: "destructive"
      });
    } finally {
      stopLoading(actionId);
    }
  };

  const unfollowUserAction = async (friendId: string) => {
    if (!currentUserId) return;
    const actionId = `unfollow_${friendId}`;

    try {
      startLoading(actionId);
      await unfollowUser(friendId);
      toast({
        title: "Dejaste de seguir",
        description: "Has dejado de seguir a este usuario"
      });
      await onUpdate();
    } catch (error: any) {
      console.error("Error unfollowing user:", error);
      toast({
        title: "Error",
        description: error?.message || "No se pudo dejar de seguir al usuario",
        variant: "destructive"
      });
    } finally {
      stopLoading(actionId);
    }
  };

  const handleFriendRequest = async (requestId: string, senderId: string, accept: boolean) => {
    const actionId = `request_${requestId}_${accept ? 'accept' : 'reject'}`;
    
    try {
      startLoading(actionId);
      if (accept) {
        await acceptFriendRequest(requestId, senderId);
        toast({
          title: "Solicitud aceptada",
          description: "Ahora son amigos"
        });
      } else {
        await rejectFriendRequest(requestId);
        toast({
          title: "Solicitud rechazada",
          description: "Has rechazado la solicitud de amistad"
        });
      }
      
      // Update data
      await onUpdate();
    } catch (error: any) {
      console.error("Error handling friend request:", error);
      toast({
        title: "Error",
        description: error?.message || "No se pudo procesar la solicitud",
        variant: "destructive"
      });
    } finally {
      stopLoading(actionId);
    }
  };

  const cancelSentRequest = async (requestId: string) => {
    const actionId = `cancel_${requestId}`;
    
    try {
      startLoading(actionId);
      await cancelFriendRequest(requestId);
      toast({
        title: "Solicitud cancelada",
        description: "Has cancelado la solicitud de amistad"
      });
      
      // Update data
      await onUpdate();
    } catch (error: any) {
      console.error("Error canceling friend request:", error);
      toast({
        title: "Error",
        description: error?.message || "No se pudo cancelar la solicitud",
        variant: "destructive"
      });
    } finally {
      stopLoading(actionId);
    }
  };

  return {
    followUser,
    unfollowUser: unfollowUserAction,
    handleFriendRequest,
    cancelSentRequest,
    isLoading
  };
}
