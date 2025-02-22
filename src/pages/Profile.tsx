
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfileImage } from "@/hooks/use-profile-image";
import { ProfileLayout } from "@/components/profile/ProfileLayout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { useToast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location: string | null;
  education: string | null;
  relationship_status: string | null;
  followers_count: number;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { handleImageUpload } = useProfileImage();
  const { toast } = useToast();

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(false);

        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);

        if (!id) {
          setError(true);
          return;
        }

        // Primero obtenemos los datos básicos del perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, bio, avatar_url, created_at, updated_at')
          .eq('id', id)
          .single();

        if (profileError || !profileData) {
          console.error('Error fetching profile:', profileError);
          setError(true);
          return;
        }

        // Get followers count
        const { count: followersCount, error: followersError } = await supabase
          .from('friendships')
          .select('*', { count: 'exact', head: true })
          .eq('friend_id', id)
          .eq('status', 'accepted');

        if (followersError) {
          console.error('Error fetching followers:', followersError);
        }

        // Crear el objeto Profile con los datos obtenidos
        const newProfile: Profile = {
          id: profileData.id,
          username: profileData.username,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          cover_url: null, // Estos campos no existen en la tabla, los inicializamos como null
          location: null,
          education: null,
          relationship_status: null,
          followers_count: followersCount || 0,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at
        };

        setProfile(newProfile);
      } catch (err) {
        console.error('Error in loadProfile:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  const onImageUpload = async (type: 'avatar' | 'cover', e: React.ChangeEvent<HTMLInputElement>): Promise<string> => {
    const url = await handleImageUpload(type, e);
    if (url && profile) {
      if (type === 'avatar') {
        setProfile({ ...profile, avatar_url: url });
      } else {
        setProfile({ ...profile, cover_url: url });
      }
      toast({
        title: "Imagen actualizada",
        description: `Tu foto de ${type === 'avatar' ? 'perfil' : 'portada'} ha sido actualizada exitosamente`,
      });
    }
    return url;
  };

  return (
    <ProfileLayout isLoading={loading} error={error}>
      {profile && (
        <>
          <ProfileHeader
            profile={profile}
            currentUserId={currentUserId}
            onImageUpload={onImageUpload}
            onProfileUpdate={handleProfileUpdate}
          />
          <div className="space-y-4 px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <ProfileInfo profile={profile} />
              </div>
              <div className="md:col-span-2">
                <ProfileContent profileId={profile.id} />
              </div>
            </div>
          </div>
        </>
      )}
    </ProfileLayout>
  );
}
