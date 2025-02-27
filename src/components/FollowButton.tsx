
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FollowButtonProps {
  targetUserId: string;
  size?: "sm" | "default" | "lg" | "icon";
}

export function FollowButton({ targetUserId, size = "default" }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Verificar si el usuario ya está siguiendo al perfil
  useEffect(() => {
    const checkFollowStatus = async () => {
      setIsLoading(true);
      try {
        // Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        setCurrentUserId(user.id);
        
        // No comprobar si se está siguiendo a sí mismo
        if (user.id === targetUserId) {
          setIsLoading(false);
          return;
        }

        // Comprobar si ya sigue al usuario
        const { data, error } = await supabase
          .from('followers')
          .select()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 es "no se encontró ningún dato"
          console.error('Error al verificar estado de seguimiento:', error);
        }
        
        setIsFollowing(!!data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFollowStatus();
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

    // No permitir seguirse a sí mismo
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
      if (isFollowing) {
        // Dejar de seguir: eliminar registro
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId);

        if (error) throw error;

        setIsFollowing(false);
        toast({
          title: "Éxito",
          description: "Has dejado de seguir a este usuario"
        });
      } else {
        // Seguir: crear registro
        const { error } = await supabase
          .from('followers')
          .insert({
            follower_id: currentUserId,
            following_id: targetUserId
          });

        if (error) throw error;

        setIsFollowing(true);
        toast({
          title: "Éxito",
          description: "Ahora estás siguiendo a este usuario"
        });
      }
    } catch (error) {
      console.error('Error al cambiar estado de seguimiento:', error);
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
    return null; // No mostrar botón en el propio perfil
  }

  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      size={size}
      onClick={handleFollowToggle}
      disabled={isLoading}
    >
      <Heart
        fill={isFollowing ? "currentColor" : "none"}
        className="h-5 w-5 mr-2"
      />
      {isFollowing ? "Siguiendo" : "Seguir"}
    </Button>
  );
}
