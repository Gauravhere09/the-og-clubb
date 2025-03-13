
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PopularUserProfile } from "@/types/database/follow.types";

export function usePopularUsers() {
  const [popularUsers, setPopularUsers] = useState<PopularUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [careerFilters, setCareerFilters] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPopularUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Iniciando búsqueda de perfiles populares");
        
        // Obtener perfiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, career, semester');

        // Manejo detallado de errores en la obtención de perfiles
        if (profilesError) {
          console.error('Error detallado al obtener perfiles:', {
            message: profilesError.message,
            code: profilesError.code,
            details: profilesError.details,
            hint: profilesError.hint
          });
          
          setError(`Error al obtener perfiles: ${profilesError.message}`);
          toast({
            title: "Error de datos",
            description: `No se pudieron cargar los perfiles: ${profilesError.message}`,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Verificación de datos antes de procesar
        if (!profiles) {
          console.warn('No se recibieron datos de perfiles de la API');
          setPopularUsers([]);
          setCareerFilters([]);
          setLoading(false);
          toast({
            title: "Sin datos",
            description: "No se encontraron perfiles de usuarios",
            variant: "default"
          });
          return;
        }

        if (profiles.length === 0) {
          console.log('La API devolvió un array de perfiles vacío');
          setPopularUsers([]);
          setCareerFilters([]);
          setLoading(false);
          return;
        }

        // Depuración de perfiles recibidos
        console.log(`Recuperados ${profiles.length} perfiles`);
        
        // Verificar la estructura de los primeros perfiles para depuración
        const sampleProfiles = profiles.slice(0, 3);
        sampleProfiles.forEach((profile, index) => {
          console.log(`Muestra de perfil ${index + 1}:`, {
            id: profile.id,
            username: profile.username,
            career: profile.career,
            careerType: typeof profile.career,
            semester: profile.semester,
            semesterType: typeof profile.semester
          });
        });

        // Procesamiento de perfiles con manejo de errores para cada uno
        const usersWithData = await Promise.all(
          profiles.map(async (profile) => {
            try {
              // Contar seguidores
              const { count: followersCount, error: followersError } = await supabase
                .from('friendships')
                .select('*', { count: 'exact', head: true })
                .eq('friend_id', profile.id)
                .eq('status', 'accepted');

              // Contar corazones
              const { count: heartsCount, error: heartsError } = await supabase
                .from('profile_hearts')
                .select('*', { count: 'exact', head: true })
                .eq('profile_id', profile.id);
                
              if (followersError) {
                console.error(`Error al contar seguidores para ${profile.username || profile.id}:`, followersError);
              }

              if (heartsError) {
                console.error(`Error al contar corazones para ${profile.username || profile.id}:`, heartsError);
              }

              // Construir objeto de usuario con seguidores y corazones
              return {
                id: profile.id,
                username: profile.username || "Usuario",
                avatar_url: profile.avatar_url,
                career: typeof profile.career === 'string' ? profile.career : null,
                semester: typeof profile.semester === 'string' ? profile.semester : null,
                followers_count: followersCount || 0,
                hearts_count: heartsCount || 0
              } as PopularUserProfile;
            } catch (profileError) {
              console.error(`Error inesperado procesando perfil ${profile.username || profile.id}:`, profileError);
              
              // Fallback para perfiles con error
              return {
                id: profile.id,
                username: profile.username || "Usuario",
                avatar_url: profile.avatar_url,
                career: null,
                semester: null,
                followers_count: 0,
                hearts_count: 0
              } as PopularUserProfile;
            }
          })
        );

        // Ordenar usuarios por número de corazones (primero) y seguidores (segundo criterio de desempate)
        const sortedUsers = [...usersWithData].sort((a, b) => {
          const heartsDiff = (b.hearts_count || 0) - (a.hearts_count || 0);
          return heartsDiff !== 0 ? heartsDiff : b.followers_count - a.followers_count;
        });

        // Verificación final de los datos procesados
        console.log(`Procesados ${sortedUsers.length} usuarios con información de seguidores y corazones`);
        
        if (sortedUsers.length > 0) {
          console.log('Muestra de usuarios ordenados (Top 3):', 
            sortedUsers.slice(0, 3).map(u => ({
              id: u.id,
              username: u.username,
              career: u.career,
              semester: u.semester,
              followers: u.followers_count,
              hearts: u.hearts_count
            }))
          );
        }

        setPopularUsers(sortedUsers);

        // Extracción de carreras para filtrado
        const careers = sortedUsers
          .map(user => user.career)
          .filter((career): career is string => 
            typeof career === 'string' && career.trim() !== '');
        
        const uniqueCareers = [...new Set(careers)];
        console.log('Carreras únicas encontradas:', uniqueCareers);
        setCareerFilters(uniqueCareers);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error crítico al cargar usuarios populares:', error);
        
        setError(errorMessage);
        toast({
          title: "Error de sistema",
          description: "Ocurrió un problema inesperado al cargar usuarios populares. Por favor, inténtalo de nuevo más tarde.",
          variant: "destructive"
        });
        
        // Establecer valores predeterminados en caso de error
        setPopularUsers([]);
        setCareerFilters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularUsers();
  }, [toast]);

  return { 
    popularUsers, 
    loading, 
    error,
    careerFilters 
  };
}
