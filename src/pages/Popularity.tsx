
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/FollowButton";
import { GraduationCap, BookOpen, Users } from "lucide-react";

interface PopularUser {
  id: string;
  username: string | null;
  avatar_url: string | null;
  career: string | null;
  semester: string | null;
  followers_count: number;
}

export default function Popularity() {
  const [popularUsers, setPopularUsers] = useState<PopularUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [careerFilters, setCareerFilters] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularUsers = async () => {
      setLoading(true);
      try {
        // Obtener usuarios
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, career, semester');

        if (error) throw error;

        // Para cada usuario, obtener el conteo de seguidores
        if (data) {
          const usersWithFollowers = await Promise.all(
            data.map(async (user: any) => {
              const { count, error: followerError } = await supabase
                .from('friendships')
                .select('*', { count: 'exact', head: true })
                .eq('friend_id', user.id)
                .eq('status', 'accepted');

              if (followerError) {
                console.error('Error al obtener seguidores:', followerError);
                return {
                  ...user,
                  followers_count: 0
                };
              }

              return {
                ...user,
                followers_count: count || 0
              };
            })
          );

          // Ordenar por número de seguidores (de mayor a menor)
          const sortedUsers = usersWithFollowers.sort((a, b) => 
            b.followers_count - a.followers_count
          );

          setPopularUsers(sortedUsers);
          
          // Extraer carreras únicas para filtros
          const careers = [...new Set(
            sortedUsers
              .map(user => user.career)
              .filter(career => career !== null)
          )] as string[];
          
          setCareerFilters(careers);
        }
      } catch (error) {
        console.error('Error al cargar usuarios populares:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularUsers();
  }, []);

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const filteredUsers = filter 
    ? popularUsers.filter(user => user.career === filter)
    : popularUsers;

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 pl-[70px]">
        <div className="container py-6 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-4">Usuarios Populares</h1>
            <p className="text-muted-foreground mb-6">
              Descubre y sigue a los usuarios más populares de la plataforma.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <Button 
                variant={filter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(null)}
              >
                Todos
              </Button>
              {careerFilters.map((career) => (
                <Button
                  key={career}
                  variant={filter === career ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(career)}
                >
                  {career}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <p>Cargando usuarios populares...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar 
                        className="h-16 w-16 cursor-pointer" 
                        onClick={() => handleProfileClick(user.id)}
                      >
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 
                          className="font-semibold text-lg cursor-pointer hover:underline"
                          onClick={() => handleProfileClick(user.id)}
                        >
                          {user.username || "Usuario"}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground space-x-2 mb-3">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{user.followers_count} seguidores</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {user.career && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {user.career}
                            </Badge>
                          )}
                          {user.semester && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Semestre {user.semester}
                            </Badge>
                          )}
                        </div>
                        
                        <FollowButton targetUserId={user.id} />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">
                    No hay usuarios con este filtro. Prueba con otro criterio.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
