
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FriendRequestButton } from "@/components/FriendRequestButton";
import { FriendsList } from "@/components/FriendsList";

interface Profile {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    getSession();
    getProfile();
  }, []);

  const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
  };

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setUsername(data.username || "");
      setBio(data.bio || "");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "¡Perfil actualizado!",
        description: "Los cambios se han guardado correctamente.",
      });

      setIsEditing(false);
      getProfile();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-muted/30">
        <Navigation />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-6 md:py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
        <div className="relative w-full h-48 rounded-lg bg-gradient-to-r from-primary/20 to-primary/40 mb-16">
          <Avatar className="absolute -bottom-12 left-6 w-32 h-32 border-4 border-background">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          {session?.user?.id === profile?.id && (
            <Button size="icon" variant="secondary" className="absolute bottom-4 right-4">
              <Camera className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">
                      Nombre de usuario
                    </label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-1">
                      Biografía
                    </label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={updateProfile}>Guardar</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-2xl font-bold mb-1">{profile?.username}</h1>
                      <p className="text-muted-foreground">@{profile?.username?.toLowerCase()}</p>
                    </div>
                    <div className="flex gap-2">
                      {session?.user?.id !== profile?.id && profile?.id && (
                        <FriendRequestButton targetUserId={profile.id} />
                      )}
                      {session?.user?.id === profile?.id && (
                        <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {profile?.bio && (
                    <p className="text-muted-foreground mb-6">{profile.bio}</p>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Amigos</h2>
                      <FriendsList />
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Fotos destacadas</h2>
                {session?.user?.id === profile?.id && (
                  <Button variant="ghost" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Añadir foto
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
