import { CalendarIcon, Briefcase, GraduationCap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Profile } from "@/types/Profile";
import { Badge } from "@/components/ui/badge";

interface ProfileInfoProps {
  profile: Profile;
  isCurrentUser: boolean;
}

export function ProfileInfo({ profile, isCurrentUser }: ProfileInfoProps) {
  return (
    <div className="space-y-4">
      {profile.bio && (
        <div>
          <h3 className="text-lg font-medium mb-1">About</h3>
          <p className="text-muted-foreground">{profile.bio}</p>
        </div>
      )}

      <div className="space-y-2">
        {profile.career && (
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>{profile.career}</span>
            {profile.semester && (
              <Badge variant="outline" className="ml-2">
                {profile.semester}
              </Badge>
            )}
          </div>
        )}

        {!profile.career && profile.semester && (
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span>Semester: {profile.semester}</span>
          </div>
        )}

        {profile.created_at && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
            </span>
          </div>
        )}
      </div>

      {isCurrentUser && !profile.bio && !profile.career && !profile.semester && (
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-muted-foreground">
            Your profile is looking a bit empty. Add some information about yourself to help others get to know you better.
          </p>
        </div>
      )}
    </div>
  );
}
