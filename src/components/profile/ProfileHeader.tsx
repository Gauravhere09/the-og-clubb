
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Edit2, ImagePlus, MessageCircle } from "lucide-react";
import { FriendRequestButton } from "@/components/FriendRequestButton";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { ChatDialog } from "@/components/messages/ChatDialog";
import type { Profile } from "@/pages/Profile";

interface ProfileHeaderProps {
  profile: Profile;
  currentUserId: string | null;
  onImageUpload: (type: 'avatar' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => Promise<string>;
  onProfileUpdate?: (profile: Profile) => void;
}

export function ProfileHeader({ profile, currentUserId, onImageUpload, onProfileUpdate }: ProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    onProfileUpdate?.(updatedProfile);
  };

  const handleMessageClick = () => {
    setIsChatOpen(true);
  };

  return (
    <>
      <div className="relative h-[300px]">
        <div className="w-full h-full bg-muted flex items-center justify-center">
          {profile.cover_url ? (
            <img 
              src={profile.cover_url} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <ImagePlus className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          {currentUserId === profile.id && (
            <div className="absolute bottom-4 right-4">
              <input
                type="file"
                id="cover-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => onImageUpload('cover', e)}
              />
              <label htmlFor="cover-upload">
                <Button
                  size="icon"
                  variant="secondary"
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    <ImagePlus className="h-4 w-4" />
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>
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
                  onChange={(e) => onImageUpload('avatar', e)}
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
                <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar perfil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <FriendRequestButton targetUserId={profile.id} />
                  <Button variant="outline" onClick={handleMessageClick}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mensaje
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProfileEditDialog
        profile={profile}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={handleProfileUpdate}
      />

      {currentUserId && (
        <ChatDialog
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          targetUser={{
            id: profile.id,
            username: profile.username || "Usuario",
            avatar_url: profile.avatar_url
          }}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}
