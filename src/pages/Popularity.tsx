
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { TopUsers } from "@/components/popularity/TopUsers";
import { UserList } from "@/components/popularity/UserList";
import { FilterButtons } from "@/components/popularity/FilterButtons";
import { LoadingState } from "@/components/popularity/LoadingState";
import type { PopularUserProfile } from "@/types/database/follow.types";
import { useToast } from "@/hooks/use-toast";

export default function Popularity() {
  const [popularUsers, setPopularUsers] = useState<PopularUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [careerFilters, setCareerFilters] = useState<string[]>([]);
  const navigate = useNavigate();
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
              career: profile.career ? String(profile.career) : null,
              semester: profile.semester ? String(profile.semester) : null,
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
                career: profile.career ? String(profile.career) : null,
                semester: profile.semester ? String(profile.semester) : null,
                followers_count: 0
              };
            }

            // Construir objeto con toda la información
            return {
              id: profile.id,
              username: profile.username,
              avatar_url: profile.avatar_url,
              career: profile.career ? String(profile.career) : null,
              semester: profile.semester ? String(profile.semester) : null,
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
            career !== null && career !== undefined && career !== '');
        
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

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const filteredUsers = filter 
    ? popularUsers.filter(user => user.career === filter)
    : popularUsers;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 pl-[70px]">
          <div className="container py-6 max-w-6xl">
            <LoadingState />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 pl-[70px]">
        <div className="container py-6 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-4">Ranking de Popularidad</h1>
            <p className="text-muted-foreground mb-6">
              Los usuarios con más corazones (seguidores) ocupan los primeros lugares. ¡Sigue a otros usuarios para ganar popularidad!
            </p>

            {careerFilters.length > 0 ? (
              <FilterButtons 
                careerFilters={careerFilters}
                currentFilter={filter}
                onFilterChange={setFilter}
              />
            ) : (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <h3 className="font-medium mb-2">Información</h3>
                <p className="text-sm">No hay carreras disponibles para filtrar. Los filtros aparecerán cuando los usuarios agreguen información académica.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                <TopUsers users={filteredUsers} onProfileClick={handleProfileClick} />
                <UserList users={filteredUsers} onProfileClick={handleProfileClick} />
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  No hay usuarios {filter ? "con este filtro" : "registrados"}. 
                  {filter && " Prueba con otro criterio."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
