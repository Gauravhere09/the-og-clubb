
import { Card } from "@/components/ui/card";
import { Home, School, MapPin, Heart } from "lucide-react";
import type { Profile } from "@/pages/Profile";

interface ProfileInfoProps {
  profile: Profile;
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  return (
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
  );
}
