
import { Card } from "@/components/ui/card";
import { Home, School, MapPin, Heart, GraduationCap, BookOpen, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/pages/Profile";

interface ProfileInfoProps {
  profile: Profile;
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está en línea al cargar el componente
    const checkOnlineStatus = async () => {
      try {
        // Consultar la presencia del usuario
        const { data } = await supabase
          .channel('online-users')
          .on('presence', { event: 'sync' }, () => {
            const state = supabase.channel('online-users').presenceState();
            const isUserOnline = Object.keys(state).includes(profile.id);
            setIsOnline(isUserOnline);
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await supabase.channel('online-users').track({
                online_at: new Date().toISOString(),
              });
            }
          });
      } catch (error) {
        console.error("Error al verificar estado online:", error);
      }
    };

    checkOnlineStatus();

    // Limpiar la suscripción al desmontar
    return () => {
      supabase.channel('online-users').unsubscribe();
    };
  }, [profile.id]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Detalles</h2>
        {isOnline && (
          <div className="flex items-center text-sm text-green-500">
            <Circle className="h-3 w-3 mr-1 fill-green-500" />
            <span>En línea</span>
          </div>
        )}
      </div>
      
      {profile.bio && (
        <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>
      )}
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
        {profile.career && (
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span>Carrera: {profile.career}</span>
          </div>
        )}
        {profile.semester && (
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span>Semestre: {profile.semester}</span>
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
  );
}
