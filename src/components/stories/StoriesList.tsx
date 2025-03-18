
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
          : story.id; // Fallback to story.id for backward compatibility
        
        // Determine if this story has been viewed
        const hasUnviewedStories = story.hasUnseenStories;
        
        return (
          <div 
            key={story.id}
            className="flex flex-col items-center space-y-1 cursor-pointer min-w-[80px] max-w-[80px]"
            onClick={() => onStoryClick(firstStoryId)}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              hasUnviewedStories ? 'border-2 border-primary' : 'border-2 border-muted'
            } p-[2px]`}>
              <div className="w-full h-full bg-black/5 dark:bg-black/20 rounded-full overflow-hidden">
                <Avatar className="w-full h-full">
                  <AvatarImage src={story.avatarUrl || undefined} />
                  <AvatarFallback>{story.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <span className="text-xs text-center truncate w-full">
              {story.username}
            </span>
          </div>
        );
      })}
    </>
  );
}
