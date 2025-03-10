
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, UserCheck, UserPlus } from "lucide-react";
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
      if (relationship === 'following' || relationship === 'friends') {
        // If already following, unfollow
        await unfollowUser(targetUserId);
        
        // Update relationship status
        const newStatus = relationship === 'friends' ? 'follower' : null;
        setRelationship(newStatus);
        
        toast({
          title: "Éxito",
          description: "Has dejado de seguir a este usuario"
        });
      } else {
        // If not following, follow
        await sendFriendRequest(targetUserId);
        
        // Update relationship status
        const newStatus = relationship === 'follower' ? 'friends' : 'following';
        setRelationship(newStatus);
        
        toast({
          title: "Éxito",
          description: "Ahora estás siguiendo a este usuario"
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
  let buttonIcon = <UserPlus className="h-5 w-5 mr-2" />;
  let isFollowing = false;

  if (relationship === 'friends') {
    buttonText = "Amigos";
    buttonIcon = <UserCheck className="h-5 w-5 mr-2" />;
    isFollowing = true;
  } else if (relationship === 'following') {
    buttonText = "Siguiendo";
    buttonIcon = <Heart fill="currentColor" className="h-5 w-5 mr-2" />;
    isFollowing = true;
  }

  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      size={size}
      onClick={handleFollowToggle}
      disabled={isLoading}
    >
      {buttonIcon}
      {buttonText}
    </Button>
  );
}
