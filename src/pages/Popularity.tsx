
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { TopUsers } from "@/components/popularity/TopUsers";
import { UserList } from "@/components/popularity/UserList";
import { FilterButtons } from "@/components/popularity/FilterButtons";
import { LoadingState } from "@/components/popularity/LoadingState";
import type { PopularUserProfile } from "@/types/database/follow.types";
import type { ProfileTable } from "@/types/database/profile.types";
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
        // Fetching all profiles from the database with career and semester
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
          throw profilesError;
        }

        if (!profiles || profiles.length === 0) {
          console.log('No se encontraron perfiles');
          setPopularUsers([]);
          setLoading(false);
          return;
        }

        console.log('Perfiles obtenidos:', profiles);
        
        // Log each profile's career and semester to debug
        profiles.forEach(profile => {
          console.log(`Usuario: ${profile.username}, Carrera: ${profile.career || 'No definida'}, Semestre: ${profile.semester || 'No definido'}`);
        });

        // For each profile, count their followers
        const usersWithFollowers = await Promise.all(
          profiles.map(async (profile) => {
            const { count } = await supabase
              .from('friendships')
              .select('*', { count: 'exact', head: true })
              .eq('friend_id', profile.id)
              .eq('status', 'accepted');

            return {
              id: profile.id,
              username: profile.username,
              avatar_url: profile.avatar_url,
              career: profile.career || null,
              semester: profile.semester || null,
              followers_count: count || 0
            } as PopularUserProfile;
          })
        );

        // Sort users by follower count
        const sortedUsers = usersWithFollowers
          .sort((a, b) => b.followers_count - a.followers_count);

        console.log('Usuarios ordenados con carrera y semestre:', sortedUsers);
        setPopularUsers(sortedUsers);

        // Extract unique careers for filtering
        const careers = sortedUsers
          .map(user => user.career)
          .filter((career): career is string => career !== null && career !== undefined && career !== '');
        
        const uniqueCareers = [...new Set(careers)];
        console.log('Carreras únicas:', uniqueCareers);
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

            <FilterButtons 
              careerFilters={careerFilters}
              currentFilter={filter}
              onFilterChange={setFilter}
            />
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
