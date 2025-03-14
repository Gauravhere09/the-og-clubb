
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfileImage } from "@/hooks/use-profile-image";
import { ProfileLayout } from "@/components/profile/ProfileLayout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProfileTable } from "@/types/database/profile.types";

export type Profile = {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location: string | null;
  education: string | null;
  career: string | null;
  semester: string | null;
  relationship_status: string | null;
  followers_count: number;
  hearts_count: number;
  created_at: string;
  updated_at: string;
  status?: 'online' | 'offline' | 'away' | null;
  last_seen?: string | null;
};

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { handleImageUpload } = useProfileImage();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

        // Si no hay ID en la URL, usar el ID del usuario actual
        const profileId = id || user?.id;
        
        if (!profileId) {
          console.error('No profile ID provided and no user logged in');
          setError(true);
          return;
        }

        // Primero obtenemos los datos básicos del perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();

        if (profileError || !profileData) {
          console.error('Error fetching profile:', profileError);
          setError(true);
          return;
        }

        const typedProfileData = profileData as ProfileTable['Row'];

        // Get followers count
        const { count: followersCount, error: followersError } = await supabase
          .from('friendships')
          .select('*', { count: 'exact', head: true })
          .eq('friend_id', profileId)
          .eq('status', 'accepted');

        if (followersError) {
          console.error('Error fetching followers:', followersError);
        }

        // Get hearts count
        const { count: heartsCount, error: heartsError } = await supabase
          .from('profile_hearts')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileId);

        if (heartsError) {
          console.error('Error fetching hearts:', heartsError);
        }

        // Obtener estado de conexión
        const status = user && user.id === profileId 
          ? 'online' 
          : profileData.last_seen 
            ? new Date(profileData.last_seen).getTime() > Date.now() - 1000 * 60 * 5 
              ? 'online' 
              : 'offline'
            : 'offline';

        // Crear el objeto Profile con los datos obtenidos
        const newProfile: Profile = {
          id: typedProfileData.id,
          username: typedProfileData.username,
          bio: typedProfileData.bio,
          avatar_url: typedProfileData.avatar_url,
          cover_url: typedProfileData.cover_url,
          location: null,
          education: null,
          career: typedProfileData.career,
          semester: typedProfileData.semester,
          relationship_status: null,
          followers_count: followersCount || 0,
          hearts_count: heartsCount || 0,
          created_at: typedProfileData.created_at,
          updated_at: typedProfileData.updated_at,
          status: typedProfileData.status || status,
          last_seen: typedProfileData.last_seen
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
    
    // Actualizar el perfil cada 2 minutos para refrescar estado de conexión
    const interval = setInterval(loadProfile, 120000);
    return () => clearInterval(interval);
  }, [id, navigate]);

  const onImageUpload = async (type: 'avatar' | 'cover', e: React.ChangeEvent<HTMLInputElement>): Promise<string> => {
    try {
      const url = await handleImageUpload(type, e);
      if (url && profile) {
        const updatedProfile = {
          ...profile,
          [type === 'avatar' ? 'avatar_url' : 'cover_url']: url
        };
        setProfile(updatedProfile);
        toast({
          title: "Imagen actualizada",
          description: `Tu foto de ${type === 'avatar' ? 'perfil' : 'portada'} ha sido actualizada exitosamente`,
        });
      }
      return url;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar la imagen",
      });
      return '';
    }
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
          <div className="space-y-4 px-2 sm:px-4 py-4 profile-info-grid">
            <div className={`grid grid-cols-1 ${!isMobile ? 'md:grid-cols-3' : ''} gap-4`}>
              <div className={`${!isMobile ? 'md:col-span-1' : ''}`}>
                <ProfileInfo profile={profile} />
              </div>
              <div className={`${!isMobile ? 'md:col-span-2' : ''}`}>
                <ProfileContent profileId={profile.id} />
              </div>
            </div>
          </div>
        </>
      )}
    </ProfileLayout>
  );
}
