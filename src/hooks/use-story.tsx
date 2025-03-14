
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface StoryData {
  id: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  imageUrls: string[];
  createdAt: string;
}

export function useStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeDisplay, setTimeDisplay] = useState("");
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!storyId) {
      navigate("/");
      return;
    }

    const fetchStory = async () => {
      try {
        setIsLoading(true);
        
        // Here would be the actual fetch from the database
        // This is mocked for demonstration purposes
        const response = await supabase
          .from("stories")
          .select(`
            id,
            created_at,
            media_url,
            user_id,
            profiles:user_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq("id", storyId)
          .single();
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        if (!response.data) {
          throw new Error("Story not found");
        }
        
        const data = response.data;
        
        setStoryData({
          id: data.id,
          user: {
            id: data.profiles.id,
            username: data.profiles.username || "Usuario",
            avatarUrl: data.profiles.avatar_url || "",
          },
          imageUrls: [data.media_url],
          createdAt: data.created_at,
        });
        
        // Format time display
        setTimeDisplay(formatDistanceToNow(new Date(data.created_at), {
          addSuffix: true,
          locale: es
        }));
        
      } catch (err) {
        console.error("Error fetching story:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStory();
  }, [storyId, navigate]);
  
  return { storyData, isLoading, timeDisplay, error };
}
