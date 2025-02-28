
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PopularUserProfile } from "@/types/database/follow.types";

export function usePopularUsers() {
  const [popularUsers, setPopularUsers] = useState<PopularUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [careerFilters, setCareerFilters] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPopularUsers = async () => {
      setLoading(true);
      try {
        // Obtenemos todos los perfiles directamente de la tabla
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, career, semester');

        if (profilesError) {
          console.error('Error al obtener perfiles:', profilesError);
          toast({
            title: "Error",
            description: "No se pudieron cargar los perfiles de usuarios",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        if (!profiles || profiles.length === 0) {
          console.log('No se encontraron perfiles');
          setPopularUsers([]);
          setLoading(false);
          return;
        }

        // Depuración detallada de cada perfil
        console.log('Perfiles recuperados:', profiles.length);
        profiles.forEach((profile, index) => {
          if (index < 5) { // Solo mostramos los primeros 5 para no saturar la consola
            console.log(`Perfil recuperado ${index + 1}:`, {
              id: profile.id,
              username: profile.username,
              career: profile.career,
              careerType: typeof profile.career,
              semester: profile.semester,
              semesterType: typeof profile.semester,
              propiedades: Object.keys(profile)
            });
          }
        });

        // Para cada perfil, contar sus seguidores
        const usersWithFollowers = await Promise.all(
          profiles.map(async (profile) => {
            // Contar seguidores (friendships donde este usuario es el amigo)
            const { count, error } = await supabase
              .from('friendships')
              .select('*', { count: 'exact', head: true })
              .eq('friend_id', profile.id)
              .eq('status', 'accepted');
              
            if (error) {
              console.error(`Error al contar seguidores para ${profile.username}:`, error);
              return {
                id: profile.id,
                username: profile.username,
                avatar_url: profile.avatar_url,
                career: typeof profile.career === 'string' ? profile.career : null,
                semester: typeof profile.semester === 'string' ? profile.semester : null,
                followers_count: 0
              };
            }

            // Construir objeto con toda la información
            return {
              id: profile.id,
              username: profile.username,
              avatar_url: profile.avatar_url,
              career: typeof profile.career === 'string' ? profile.career : null,
              semester: typeof profile.semester === 'string' ? profile.semester : null,
              followers_count: count || 0
            } as PopularUserProfile;
          })
        );

        // Ordenar usuarios por número de seguidores (descendente)
        const sortedUsers = [...usersWithFollowers].sort((a, b) => 
          b.followers_count - a.followers_count
        );

        console.log('Usuarios ordenados (Top 5):', sortedUsers.slice(0, 5).map(u => ({
          id: u.id,
          username: u.username,
          career: u.career,
          semester: u.semester,
          followers: u.followers_count
        })));

        setPopularUsers(sortedUsers);

        // Extraer carreras únicas para filtrado (solo las no nulas)
        const careers = sortedUsers
          .map(user => user.career)
          .filter((career): career is string => 
            typeof career === 'string' && career !== '');
        
        const uniqueCareers = [...new Set(careers)];
        setCareerFilters(uniqueCareers);
      } catch (error) {
        console.error('Error al cargar usuarios populares:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios populares",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPopularUsers();
  }, [toast]);

  return { popularUsers, loading, careerFilters };
}
