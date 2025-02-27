
import { Card } from "@/components/ui/card";
import { Home, School, MapPin, Heart, GraduationCap, BookOpen } from "lucide-react";
import type { Profile } from "@/pages/Profile";

interface ProfileInfoProps {
  profile: Profile;
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  return (
    <Card className="p-4">
      <h2 className="font-semibold mb-4">Detalles</h2>
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
