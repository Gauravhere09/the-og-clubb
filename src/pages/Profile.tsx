
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Loader2, Camera, Edit2, Globe2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FriendRequestButton } from "@/components/FriendRequestButton";
import { useQuery } from "@tanstack/react-query";

interface Profile {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  followers_count?: number;
  following_count?: number;
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };

    getCurrentUser();
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      if (!id) throw new Error("ID de perfil no proporcionado");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Perfil no encontrado");

      // Obtener conteos de seguidores y seguidos
      const { count: followersCount } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .eq("friend_id", id)
        .eq("status", "accepted");

      const { count: followingCount } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .eq("user_id", id)
        .eq("status", "accepted");

      return {
        ...data,
        followers_count: followersCount || 0,
        following_count: followingCount || 0
      };
    },
    retry: false,
    meta: {
      errorHandler: (error: any) => {
        console.error("Error loading profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el perfil",
        });
        navigate("/");
      }
    }
  });

  const handleImageUpload = async (type: 'avatar' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || !e.target.files[0]) return;

      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("El archivo no puede ser mayor a 2MB");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUserId}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          [`${type}_url`]: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUserId);

      if (updateError) throw updateError;

      toast({
        title: "Imagen actualizada",
        description: "La imagen se ha actualizado correctamente",
      });

      // Forzar recarga de la página para ver los cambios
      window.location.reload();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar la imagen",
      });
    }
  };

  if (isLoading) {
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
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Globe2 className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
            {currentUserId === profile.id && (
              <div className="absolute right-4 top-4">
                <input
                  type="file"
                  id="cover-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('cover', e)}
                />
                <label htmlFor="cover-upload">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      <Camera className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>
                      {profile.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {currentUserId === profile.id && (
                    <div className="absolute -right-2 -bottom-2">
                      <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('avatar', e)}
                      />
                      <label htmlFor="avatar-upload">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="cursor-pointer"
                          asChild
                        >
                          <span>
                            <Camera className="h-4 w-4" />
                          </span>
                        </Button>
                      </label>
                    </div>
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
                  <div className="flex gap-4 mt-2">
                    <p className="text-sm">
                      <span className="font-semibold">{profile.followers_count}</span>{" "}
                      <span className="text-muted-foreground">Seguidores</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">{profile.following_count}</span>{" "}
                      <span className="text-muted-foreground">Siguiendo</span>
                    </p>
                  </div>
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
