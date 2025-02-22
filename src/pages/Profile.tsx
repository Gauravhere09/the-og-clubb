
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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);

        if (!id) {
          setError(true);
          return;
        }

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, bio, avatar_url, location, education, relationship_status, created_at, updated_at')
          .eq('id', id)
          .single();

        if (profileError || !data) {
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

        setProfile({
          ...data,
          followers_count: followersCount || 0
        });
      } catch (err) {
        console.error('Error in loadProfile:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  const onImageUpload = async (type: 'avatar', e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const url = await handleImageUpload(type, e);
      if (url && profile) {
        setProfile({ ...profile, avatar_url: url });
        toast({
          title: "Imagen actualizada",
          description: "Tu foto de perfil ha sido actualizada exitosamente",
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la imagen",
      });
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
