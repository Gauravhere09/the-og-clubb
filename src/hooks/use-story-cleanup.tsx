
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useStoryCleanup() {
  const { toast } = useToast();

  const cleanupExpiredStories = async () => {
    try {
      // Obtener la fecha actual
      const now = new Date().toISOString();
      
      // Eliminar historias caducadas (que han pasado las 24 horas)
      const { error, count } = await supabase
        .from('stories')
        .delete()
        .lt('expires_at', now)
        .select('count');
      
      if (error) {
        console.error("Error al limpiar historias caducadas:", error);
        return;
      }
      
      if (count && count > 0) {
        console.log(`Se eliminaron ${count} historias caducadas`);
      }
    } catch (error) {
      console.error("Error en la limpieza de historias:", error);
    }
  };

  useEffect(() => {
    // Ejecutar limpieza al cargar
    cleanupExpiredStories();
    
    // Configurar intervalo para ejecutar la limpieza periódicamente (cada 30 minutos)
    const interval = setInterval(() => {
      cleanupExpiredStories();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { cleanupExpiredStories };
}
