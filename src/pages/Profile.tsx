
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/types/database";
import { ProfileLayout } from "@/components/profile/ProfileLayout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { useProfileImage } from "@/hooks/use-profile-image";

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface Profile extends ProfileRow {
  followers_count?: number;
  following_count?: number;
  location?: string | null;
  education?: string | null;
  relationship_status?: string | null;
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { handleImageUpload } = useProfileImage();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };

    getCurrentUser();
  }, []);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      if (!id) throw new Error("ID de perfil no proporcionado");

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          bio,
          avatar_url,
          created_at,
          updated_at
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw new Error("Error al cargar el perfil");
      }

      if (!profileData) {
        throw new Error("Perfil no encontrado");
      }

      const { count: followersCount } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .eq("friend_id", id)
        .eq("status", "accepted");

      const { count: followingCount } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .eq("user_id", id)
        .eq("status", "accepted");

      const result: Profile = {
        ...profileData,
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
        location: null,
        education: null,
        relationship_status: null
      };

      return result;
    },
    enabled: !!id,
    retry: 1,
    meta: {
      errorHandler: (error: any) => {
        console.error("Error loading profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el perfil",
        });
      }
    }
  });

  return (
    <ProfileLayout isLoading={isLoading} error={!!error}>
      {profile && (
        <>
          <ProfileHeader
            profile={profile}
            currentUserId={currentUserId}
            onImageUpload={handleImageUpload}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            <div className="space-y-4">
              <ProfileInfo profile={profile} />
            </div>
            <div className="md:col-span-2">
              <ProfileContent />
            </div>
          </div>
        </>
      )}
    </ProfileLayout>
  );
}
