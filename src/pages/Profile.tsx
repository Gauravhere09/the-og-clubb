import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Loader2, Camera, Edit2, Globe2, Home, School, MapPin, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FriendRequestButton } from "@/components/FriendRequestButton";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/types/database.types";

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface Profile extends ProfileRow {
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

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      if (!id) throw new Error("ID de perfil no proporcionado");

      const { data: profileExists, error: existsError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", id)
        .single();

      if (existsError || !profileExists) {
        throw new Error("Perfil no encontrado");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          bio,
          avatar_url,
          cover_url,
          created_at,
          updated_at
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error fetching profile:", error);
        throw new Error("Error al cargar el perfil");
      }

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

      const result: Profile = {
        id: data.id,
        username: data.username,
        bio: data.bio || null,
        avatar_url: data.avatar_url,
        cover_url: data.cover_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
        location: null,
        education: null,
        relationship_status: null,
        followers_count: followersCount || 0,
        following_count: followingCount || 0
      };

      return result;
    },
    enabled: !!id,
    retry: 1,
    meta: {
      errorHandler: (error: any) => {
        console.error("Error loading profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el perfil",
        });
      }
    }
  });

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

  if (error || !profile) {
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

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto">
        <div className="space-y-4">
          <div className="relative h-[300px]">
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

          <div className="relative px-6 -mt-[64px]">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background">
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
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {profile.username || "Usuario sin nombre"}
                    </h1>
                    <p className="text-muted-foreground">
                      {profile.followers_count} amigos
                    </p>
                  </div>
                  {currentUserId === profile.id ? (
                    <Button variant="outline" onClick={() => navigate("/settings")}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar perfil
                    </Button>
                  ) : (
                    <FriendRequestButton targetUserId={profile.id} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            <div className="space-y-4">
              <Card className="p-4">
                <h2 className="font-semibold mb-4">Detalles</h2>
                <div className="space-y-3">
                  {profile.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>Vive en {profile.location}</span>
                    </div>
                  )}
                  {profile.education && (
                    <div className="flex items-center gap-2 text-sm">
                      <School className="h-4 w-4 text-muted-foreground" />
                      <span>Estudió en {profile.education}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>De {profile.location}</span>
                    </div>
                  )}
                  {profile.relationship_status && (
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.relationship_status}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="p-4">
                <h2 className="font-semibold mb-4">Publicaciones</h2>
                <p className="text-muted-foreground text-center py-8">
                  No hay publicaciones para mostrar
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
