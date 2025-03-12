
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  hasUnseenStories: boolean;
}

interface StoriesListProps {
  stories: Story[];
  onStoryClick: (storyId: string) => void;
  currentUserId?: string;
}

export function StoriesList({ stories, onStoryClick, currentUserId }: StoriesListProps) {
  // Consulta a la base de datos para ver qué historias ha visto el usuario actual
  const { data: viewedStoryIds = [] } = useQuery({
    queryKey: ["viewed-stories", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      const { data, error } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('viewer_id', currentUserId);
        
      if (error) {
        console.error("Error fetching viewed stories:", error);
        return [];
      }
      
      return data.map(view => view.story_id);
    },
    enabled: !!currentUserId
  });
  
  return (
    <>
      {stories.map((story) => {
        // Determinar si esta historia ha sido vista o no
        const isViewed = viewedStoryIds.includes(story.id);
        
        return (
          <div 
            key={story.id}
            className="flex flex-col items-center space-y-1 cursor-pointer"
            onClick={() => onStoryClick(story.id)}
          >
            <div>
              <Avatar className={`w-16 h-16 ${
                !isViewed && story.hasUnseenStories 
                  ? "border-2 border-primary p-[2px]" 
                  : "border-2 border-muted p-[2px]"
              } ${story.userId === currentUserId ? "ring-2 ring-primary" : ""}`}>
                <AvatarImage src={story.avatarUrl || undefined} />
                <AvatarFallback>{story.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-muted-foreground">
              {story.userId === currentUserId ? "Tu historia" : story.username}
            </span>
          </div>
        );
      })}
    </>
  );
}
