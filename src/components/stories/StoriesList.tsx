
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  hasUnseenStories: boolean;
  storyIds?: string[];
}

interface StoriesListProps {
  stories: Story[];
  onStoryClick: (storyId: string) => void;
  currentUserId?: string;
}

export function StoriesList({ stories, onStoryClick, currentUserId }: StoriesListProps) {
  // Query the database to see which stories the current user has viewed
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
  
  // If there are no stories, show nothing
  if (stories.length === 0) {
    return null;
  }
  
  return (
    <>
      {stories.map((story) => {
        // Select the first story ID to show when clicked
        const firstStoryId = story.storyIds && story.storyIds.length > 0 
          ? story.storyIds[0] 
          : story.id;
        
        // Determine if this story has been viewed
        const hasUnviewedStories = story.hasUnseenStories;
        
        return (
          <div 
            key={story.id}
            className="flex flex-col items-center gap-1 cursor-pointer min-w-[80px]"
            onClick={() => onStoryClick(firstStoryId)}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              hasUnviewedStories ? 'border-2 border-primary' : ''
            } p-[2px]`}>
              <Avatar className="w-full h-full border-2 border-background">
                <AvatarImage src={story.avatarUrl || undefined} />
                <AvatarFallback>{story.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs font-medium text-center truncate w-full">
              {story.username}
            </span>
          </div>
        );
      })}
    </>
  );
}
