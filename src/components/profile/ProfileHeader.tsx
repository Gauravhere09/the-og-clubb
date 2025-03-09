
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Edit2, ImagePlus, MessageCircle, Maximize } from "lucide-react";
import { FollowButton } from "@/components/FollowButton";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { ChatDialog } from "@/components/messages/ChatDialog";
import { FullScreenImage } from "@/components/profile/FullScreenImage";
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
  const [fullscreenImage, setFullscreenImage] = useState<{url: string, type: 'avatar' | 'cover'} | null>(null);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    onProfileUpdate?.(updatedProfile);
  };

  const handleMessageClick = () => {
    setIsChatOpen(true);
  };

  const openFullScreenImage = (type: 'avatar' | 'cover') => {
    const url = type === 'avatar' ? profile.avatar_url : profile.cover_url;
    if (url) {
      setFullscreenImage({ url, type });
    }
  };

  return (
    <>
      <div className="relative h-[300px]">
        <div className="w-full h-full bg-muted flex items-center justify-center">
          {profile.cover_url ? (
            <div className="relative w-full h-full">
              <img 
                src={profile.cover_url} 
                alt="Cover" 
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => openFullScreenImage('cover')}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute bottom-4 right-16 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => openFullScreenImage('cover')}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
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
            <Avatar 
              className="h-32 w-32 border-4 border-background cursor-pointer"
              onClick={() => profile.avatar_url && openFullScreenImage('avatar')}
            >
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>
                {profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {profile.avatar_url && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-0 right-0 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => openFullScreenImage('avatar')}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            )}
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
                  {profile.followers_count} seguidores
                </p>
              </div>
              {currentUserId === profile.id ? (
                <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar perfil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <FollowButton targetUserId={profile.id} />
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

      {fullscreenImage && (
        <FullScreenImage
          isOpen={!!fullscreenImage}
          onClose={() => setFullscreenImage(null)}
          imageUrl={fullscreenImage.url}
          altText={fullscreenImage.type === 'avatar' ? `Foto de perfil de ${profile.username}` : 'Foto de portada'}
        />
      )}
    </>
  );
}
