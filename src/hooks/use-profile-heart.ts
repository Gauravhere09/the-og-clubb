
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { giveHeartToProfile, hasGivenHeartToProfile, countProfileHearts } from "@/lib/api/hearts";
import { supabase } from "@/integrations/supabase/client";

export function useProfileHeart(profileId: string) {
  const [hasGivenHeart, setHasGivenHeart] = useState(false);
  const [heartsCount, setHeartsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Verificar si el usuario ha dado corazón y contar corazones
  useEffect(() => {
    const loadHeartData = async () => {
      try {
        setIsLoading(true);
        const [hasHeart, count] = await Promise.all([
          hasGivenHeartToProfile(profileId),
          countProfileHearts(profileId)
        ]);
        
        setHasGivenHeart(hasHeart);
        setHeartsCount(count);
      } catch (error) {
        console.error("Error al cargar datos de corazones:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHeartData();

    // Suscribirse a cambios en tiempo real para corazones
    const channel = supabase
      .channel('profile-hearts')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'profile_hearts',
          filter: `profile_id=eq.${profileId}`
        },
        () => {
          // Actualizar contador cuando hay cambios
          countProfileHearts(profileId).then(setHeartsCount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  // Función para dar/quitar corazón
  const toggleHeart = async () => {
    try {
      setIsLoading(true);
      const result = await giveHeartToProfile(profileId);
      
      setHasGivenHeart(!result.removed);
      
      toast({
        title: result.removed ? "Corazón eliminado" : "Corazón añadido",
        description: result.removed 
          ? "Has quitado tu corazón de este perfil" 
          : "Has dado un corazón a este perfil",
        variant: result.removed ? "default" : "default",
      });
      
      // Actualizar contador
      const newCount = await countProfileHearts(profileId);
      setHeartsCount(newCount);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la acción",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasGivenHeart,
    heartsCount,
    isLoading,
    toggleHeart
  };
}
