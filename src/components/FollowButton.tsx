
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, UserCheck, UserPlus, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { checkFriendship, sendFriendRequest, unfollowUser } from "@/lib/api/friends";

interface FollowButtonProps {
  targetUserId: string;
  size?: "sm" | "default" | "lg" | "icon";
}

export function FollowButton({ targetUserId, size = "default" }: FollowButtonProps) {
  const [relationship, setRelationship] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check the relationship between users
  useEffect(() => {
    const checkRelationshipStatus = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        setCurrentUserId(user.id);
        
        // Don't check relationship with self
        if (user.id === targetUserId) {
          setIsLoading(false);
          return;
        }

        // Check relationship with target user
        const status = await checkFriendship(targetUserId);
        setRelationship(status);
      } catch (error) {
        console.error('Error checking relationship:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRelationshipStatus();
  }, [targetUserId]);

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para seguir a otros usuarios",
        variant: "destructive"
      });
      return;
    }

    // Don't allow following yourself
    if (currentUserId === targetUserId) {
      toast({
        title: "Error",
        description: "No puedes seguirte a ti mismo",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (relationship === 'following' || relationship === 'friends' || relationship === 'pending') {
        // Si ya estoy siguiendo o tengo solicitud pendiente, dejar de seguir
        await unfollowUser(targetUserId);
        
        // Update relationship status
        setRelationship(relationship === 'friends' ? 'follower' : null);
        
        toast({
          title: "Éxito",
          description: "Has dejado de seguir a este usuario"
        });
      } else {
        // Si no estoy siguiendo, enviar solicitud
        const result = await sendFriendRequest(targetUserId);
        
        // Update relationship status
        setRelationship(result.status);
        
        toast({
          title: "Solicitud enviada",
          description: "Has enviado una solicitud de amistad"
        });
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la operación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUserId === targetUserId) {
    return null; // Don't show button on own profile
  }

  // Determine the button text and icon based on relationship
  let buttonText = "Seguir";
  let buttonIcon = <UserPlus className="h-5 w-5" />;
  let isFollowing = false;
  let isPending = false;

  if (relationship === 'friends') {
    buttonText = "Amigos";
    buttonIcon = <UserCheck className="h-5 w-5" />;
    isFollowing = true;
  } else if (relationship === 'following') {
    buttonText = "Siguiendo";
    buttonIcon = <Heart fill="currentColor" className="h-5 w-5" />;
    isFollowing = true;
  } else if (relationship === 'pending') {
    buttonText = "Pendiente";
    buttonIcon = <Clock className="h-5 w-5" />;
    isPending = true;
  }

  // For "sm" size, we want to adjust the text and icon size
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  
  return (
    <Button
      variant={isFollowing ? "default" : isPending ? "secondary" : "outline"}
      size={size}
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`flex items-center gap-1 ${size === "sm" ? "px-3 py-1 h-8 text-xs" : ""}`}
    >
      {size !== "sm" && buttonIcon}
      {buttonText}
    </Button>
  );
}
