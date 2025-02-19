
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/notifications";
import { useToast } from "@/hooks/use-toast";

export interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
}

export function useFriends(currentUserId: string | null) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUserId) return;
    
    const loadFriends = async () => {
      try {
        console.log('Loading friends for user:', currentUserId);
        
        const { data: friendships, error: friendshipsError } = await supabase
          .from('friendships')
          .select('*')
          .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

        if (friendshipsError) {
          console.error('Error loading friendships:', friendshipsError);
          return;
        }

        if (!friendships || friendships.length === 0) {
          console.log('No friendships found');
          setFriends([]);
          return;
        }

        const friendIds = friendships.map(friendship => 
          friendship.user_id === currentUserId ? friendship.friend_id : friendship.user_id
        );

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', friendIds);

        if (profilesError) {
          console.error('Error loading profiles:', profilesError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudieron cargar los amigos",
          });
          return;
        }

        if (!profiles) {
          console.log('No profiles found');
          setFriends([]);
          return;
        }

        const friendsList = profiles.map(profile => ({
          friend_id: profile.id,
          friend_username: profile.username || '',
          friend_avatar_url: profile.avatar_url
        }));

        setFriends(friendsList);
      } catch (error) {
        console.error('Error loading friends:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los amigos",
        });
      }
    };

    loadFriends();
  }, [currentUserId]);

  return friends;
}
