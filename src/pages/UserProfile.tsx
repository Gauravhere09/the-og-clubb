
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Loader2, UserMinus, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
}

export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
    
    const subscription = supabase
      .channel('profile_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships'
      }, () => {
        checkFriendshipStatus();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
      }

      // Obtener perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      
      if (profileData) {
        setProfile(profileData);
        await checkFriendshipStatus();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el perfil",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFriendshipStatus = async () => {
    try {
      if (!currentUser || !id) return;

      const { data, error } = await supabase
        .from('friendships')
        .select('status')
        .or(`and(user_id.eq.${currentUser},friend_id.eq.${id}),and(user_id.eq.${id},friend_id.eq.${currentUser})`)
        .maybeSingle();

      if (error) throw error;
      setFriendshipStatus(data?.status || null);
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  };

  const handleFriendRequest = async () => {
    if (!currentUser || !id) return;
    
    try {
      setActionLoading(true);

      if (!friendshipStatus) {
        // Enviar solicitud
        const { error } = await supabase
          .from('friendships')
          .insert({
            user_id: currentUser,
            friend_id: id,
            status: 'pending'
          });

        if (error) throw error;

        toast({
          title: "Solicitud enviada",
          description: "La solicitud de amistad ha sido enviada",
        });
      } else {
        // Cancelar solicitud o eliminar amistad
        const { error } = await supabase
          .from('friendships')
          .delete()
          .or(`user_id.eq.${currentUser},user_id.eq.${id}`);

        if (error) throw error;

        toast({
          title: friendshipStatus === 'accepted' ? "Amistad eliminada" : "Solicitud cancelada",
          description: friendshipStatus === 'accepted' 
            ? "Has eliminado la amistad con este usuario"
            : "Has cancelado la solicitud de amistad",
        });
      }

      await checkFriendshipStatus();
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la solicitud",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-muted/30">
        <Navigation />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex bg-muted/30">
        <Navigation />
        <main className="flex-1 p-6">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Usuario no encontrado</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto p-6">
        <Card className="overflow-hidden">
          {profile.cover_url && (
            <div className="h-48 overflow-hidden">
              <img
                src={profile.cover_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">
                    {profile.username || "Usuario"}
                  </h1>
                  {profile.bio && (
                    <p className="text-muted-foreground mt-1">{profile.bio}</p>
                  )}
                </div>
              </div>
              {currentUser && currentUser !== profile.id && (
                <Button
                  onClick={handleFriendRequest}
                  disabled={actionLoading}
                  variant={friendshipStatus === 'accepted' ? 'secondary' : 'default'}
                >
                  {actionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : friendshipStatus === 'accepted' ? (
                    <UserMinus className="mr-2 h-4 w-4" />
                  ) : friendshipStatus === 'pending' ? (
                    <UserCheck className="mr-2 h-4 w-4" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  {friendshipStatus === 'accepted'
                    ? 'Eliminar amigo'
                    : friendshipStatus === 'pending'
                    ? 'Cancelar solicitud'
                    : 'Agregar amigo'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
