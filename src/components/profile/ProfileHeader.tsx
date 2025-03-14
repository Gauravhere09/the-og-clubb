
import { useState } from "react";
import { ProfileCover } from "./ProfileCover";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileStats } from "./ProfileStats";
import { ProfileActions } from "./ProfileActions";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { ChatDialog } from "@/components/messages/ChatDialog";
import { FullScreenImage } from "@/components/profile/FullScreenImage";
import { useProfileHeart } from "@/hooks/use-profile-heart";
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
  const { hasGivenHeart, heartsCount, isLoading: heartLoading, toggleHeart } = useProfileHeart(profile.id);

  const isOwner = currentUserId === profile.id;

  const handleProfileUpdate = (updatedProfile: Profile) => {
    onProfileUpdate?.(updatedProfile);
  };

  const handleMessageClick = () => {
    setIsChatOpen(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    return onImageUpload('avatar', e);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    return onImageUpload('cover', e);
  };

  const openFullScreenAvatar = () => {
    if (profile.avatar_url) {
      setFullscreenImage({ url: profile.avatar_url, type: 'avatar' });
    }
  };

  const openFullScreenCover = () => {
    if (profile.cover_url) {
      setFullscreenImage({ url: profile.cover_url, type: 'cover' });
    }
  };

  return (
    <>
      <ProfileCover 
        coverUrl={profile.cover_url}
        isOwner={isOwner}
        onUpload={handleCoverUpload}
        onOpenFullscreen={openFullScreenCover}
      />

      <div className="relative px-6 -mt-[64px]">
        <div className="flex items-end gap-4">
          <ProfileAvatar
            avatarUrl={profile.avatar_url}
            username={profile.username}
            isOwner={isOwner}
            onUpload={handleAvatarUpload}
            onOpenFullscreen={openFullScreenAvatar}
          />
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {profile.username || "Usuario sin nombre"}
                </h1>
                <ProfileStats 
                  followersCount={profile.followers_count}
                  heartsCount={heartsCount}
                  hasGivenHeart={hasGivenHeart}
                />
              </div>
              
              <ProfileActions
                isOwner={isOwner}
                profileId={profile.id}
                hasGivenHeart={hasGivenHeart}
                heartLoading={heartLoading}
                currentUserId={currentUserId}
                onEditClick={() => setIsEditDialogOpen(true)}
                onMessageClick={handleMessageClick}
                onToggleHeart={toggleHeart}
              />
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
