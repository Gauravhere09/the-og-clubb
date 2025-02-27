
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/FollowButton";
import { GraduationCap, BookOpen, Users, Heart, Award, Medal } from "lucide-react";

interface PopularUser {
  id: string;
  username: string | null;
  avatar_url: string | null;
  career: string | null;
  semester: string | null;
  followers_count: number;
  rank?: number;
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
          
          // Añadir el rango (posición) a cada usuario
          const rankedUsers = sortedUsers.map((user, index) => ({
            ...user,
            rank: index + 1
          }));

          setPopularUsers(rankedUsers);
          
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
            <h1 className="text-2xl font-bold mb-4">Ranking de Popularidad</h1>
            <p className="text-muted-foreground mb-6">
              Los usuarios con más corazones (seguidores) ocupan los primeros lugares. ¡Sigue a otros usuarios para ganar popularidad!
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
              <p>Cargando ranking de popularidad...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {/* Top 3 destacados */}
                  {filteredUsers.slice(0, 3).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {filteredUsers.slice(0, 3).map((user, index) => (
                        <Card 
                          key={user.id} 
                          className={`overflow-hidden ${index === 0 ? 'border-amber-500 border-2' : index === 1 ? 'border-gray-400 border-2' : index === 2 ? 'border-amber-700 border-2' : ''}`}
                        >
                          <div className="p-6 relative">
                            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center">
                              {index === 0 ? (
                                <Award className="h-6 w-6" />
                              ) : index === 1 ? (
                                <Medal className="h-6 w-6" />
                              ) : (
                                <span className="text-lg font-bold">3</span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-center mb-4">
                              <Avatar 
                                className="h-20 w-20 cursor-pointer border-4 border-background" 
                                onClick={() => handleProfileClick(user.id)}
                              >
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback>
                                  {user.username?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            
                            <div className="text-center mb-4">
                              <h3 
                                className="font-semibold text-lg cursor-pointer hover:underline"
                                onClick={() => handleProfileClick(user.id)}
                              >
                                {user.username || "Usuario"}
                              </h3>
                              
                              <div className="flex flex-wrap justify-center gap-2 mt-2">
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
                            </div>
                            
                            <div className="flex justify-center items-center text-lg font-semibold text-primary gap-1 mb-4">
                              <Heart className="h-5 w-5 fill-primary text-primary" />
                              <span>{user.followers_count} corazones</span>
                            </div>
                            
                            <div className="flex justify-center">
                              <FollowButton targetUserId={user.id} />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Lista del resto de usuarios */}
                  <Card className="overflow-hidden">
                    <div className="p-4">
                      <div className="text-sm font-medium text-muted-foreground mb-4 px-2 grid grid-cols-12 gap-2">
                        <div className="col-span-1">#</div>
                        <div className="col-span-4">Usuario</div>
                        <div className="col-span-3">Carrera</div>
                        <div className="col-span-2">Semestre</div>
                        <div className="col-span-2 text-right">Corazones</div>
                      </div>
                      <div className="space-y-2">
                        {filteredUsers.slice(3).map((user) => (
                          <div 
                            key={user.id} 
                            className="p-2 hover:bg-muted/50 rounded-md grid grid-cols-12 gap-2 items-center"
                          >
                            <div className="col-span-1 font-medium text-muted-foreground">
                              {user.rank}
                            </div>
                            <div className="col-span-4">
                              <div className="flex items-center space-x-3">
                                <Avatar 
                                  className="h-8 w-8 cursor-pointer" 
                                  onClick={() => handleProfileClick(user.id)}
                                >
                                  <AvatarImage src={user.avatar_url || undefined} />
                                  <AvatarFallback>
                                    {user.username?.[0]?.toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div 
                                  className="font-medium cursor-pointer hover:underline"
                                  onClick={() => handleProfileClick(user.id)}
                                >
                                  {user.username || "Usuario"}
                                </div>
                              </div>
                            </div>
                            <div className="col-span-3 truncate">
                              {user.career || "-"}
                            </div>
                            <div className="col-span-2">
                              {user.semester ? `Semestre ${user.semester}` : "-"}
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-1">
                              <Heart className="h-4 w-4 text-primary fill-primary" />
                              <span className="font-semibold">{user.followers_count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-10">
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
