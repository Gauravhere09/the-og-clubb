
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StoryData {
  id: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  imageUrls: string[];
  createdAt: string;
}

export function useStory(storyId: string) {
  const { data: storyData, isLoading } = useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      // First get the story
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('id, image_url, created_at, user_id')
        .eq('id', storyId)
        .single();
        
      if (storyError) throw storyError;
      
      // Then get the user profile separately
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', story.user_id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }
      
      // Record view if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('story_views')
          .upsert({
            story_id: storyId,
            viewer_id: user.id
          }, { onConflict: 'story_id,viewer_id' });
      }
      
      return {
        id: story.id,
        user: {
          id: story.user_id,
          username: profile?.username || "Usuario",
          avatarUrl: profile?.avatar_url
        },
        imageUrls: [story.image_url],
        createdAt: story.created_at
      };
    }
  });

  // Create a placeholder while loading
  const displayData = storyData || {
    id: storyId,
    user: {
      id: `user${storyId}`,
      username: "Cargando...",
      avatarUrl: null
    },
    imageUrls: ["https://via.placeholder.com/800x1200?text=Cargando..."],
    createdAt: new Date().toISOString()
  };

  // Calculate time ago
  const timeAgo = new Date().getTime() - new Date(displayData.createdAt).getTime();
  const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
  const minutesAgo = Math.floor((timeAgo % (1000 * 60 * 60)) / (1000 * 60));
  
  const timeDisplay = hoursAgo > 0 
    ? `Hace ${hoursAgo}h ${minutesAgo}m` 
    : `Hace ${minutesAgo}m`;

  return {
    storyData: displayData,
    isLoading,
    timeDisplay
  };
}
