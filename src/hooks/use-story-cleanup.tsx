
import { useEffect } from 'react';
import { cleanupExpiredStories } from "@/components/stories/utils/story-utils";
import { useToast } from "@/hooks/use-toast";

export function useStoryCleanup() {
  const { toast } = useToast();

  useEffect(() => {
    // Ejecutar limpieza al cargar
    cleanupExpiredStories().then(count => {
      if (count > 0) {
        console.log(`Se eliminaron ${count} historias caducadas`);
      }
    });
    
    // Configurar intervalo para ejecutar la limpieza periódicamente (cada 30 minutos)
    const interval = setInterval(() => {
      cleanupExpiredStories().then(count => {
        if (count > 0) {
          console.log(`Se eliminaron ${count} historias caducadas`);
        }
      });
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { cleanupExpiredStories };
}
