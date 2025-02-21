
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Loader2, Camera, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FriendRequestButton } from "@/components/FriendRequestButton";

interface Profile {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        
        // Obtener el usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }

        if (!id) {
          throw new Error("ID de perfil no proporcionado");
        }

        // Obtener el perfil solicitado
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile(data);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Perfil no encontrado",
          });
          navigate('/');
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el perfil",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getProfile();
    }
  }, [id, toast, navigate]);

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
            <p className="text-muted-foreground">Perfil no encontrado</p>
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
          <div className="relative h-48">
            {profile.cover_url ? (
              <img
                src={profile.cover_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
            {currentUserId === profile.id && (
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-4 top-4"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>
                      {profile.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {currentUserId === profile.id && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -right-2 -bottom-2"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">
                      {profile.username || "Usuario sin nombre"}
                    </h1>
                    {currentUserId === profile.id && (
                      <Button size="icon" variant="ghost">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {profile.bio && (
                    <p className="text-muted-foreground mt-1">{profile.bio}</p>
                  )}
                </div>
              </div>
              {currentUserId && currentUserId !== profile.id && (
                <FriendRequestButton targetUserId={profile.id} />
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
