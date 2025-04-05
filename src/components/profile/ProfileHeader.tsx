import { Button } from "@/components/ui/button";
import { Edit, Mail } from "lucide-react";
import { useState } from "react";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { FriendRequestButton } from "@/components/FriendRequestButton";
import { Link } from "react-router-dom";
import { FullScreenImage } from "@/components/profile/FullScreenImage";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Profile } from "@/types/Profile";

interface ProfileHeaderProps {
  profile: Profile;
  isCurrentUser: boolean;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

export function ProfileHeader({
  profile,
  isCurrentUser,
  onProfileUpdate,
}: ProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);

  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    onProfileUpdate(updatedProfile);
  };

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-48 bg-muted rounded-md overflow-hidden relative">
        <img
          src={profile.cover_url || "/placeholder-image.jpg"}
          alt="Cover"
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setIsImageOpen(true)}
        />
      </div>

      {/* Profile Picture and Details */}
      <div className="absolute left-4 -bottom-16 flex items-end gap-4">
        <ProfileAvatar profile={profile} size="lg" onClick={() => setIsImageOpen(true)} />

        <div>
          <h1 className="text-2xl font-bold">{profile.username || "User"}</h1>
          <p className="text-muted-foreground">
            {profile.status || "No status yet"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute right-4 top-4 flex gap-2">
        {isCurrentUser ? (
          <Button variant="outline" size="icon" onClick={handleEditProfile}>
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <FriendRequestButton targetUserId={profile.id} />
            <Link to={`/messages?user=${profile.id}`}>
              <Button variant="secondary" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <ProfileEditDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        profile={profile}
        onUpdate={handleProfileUpdate}
      />

      {/* Full Screen Image Dialog */}
      <FullScreenImage
        isOpen={isImageOpen}
        onClose={() => setIsImageOpen(false)}
        imageUrl={profile.cover_url || "/placeholder-image.jpg"}
      />
    </div>
  );
}
