
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { StoryCreatorModal } from "./StoryCreatorModal";
import { StoryView } from "./StoryView";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Story } from "./types";

interface StoryViewerProps {
  currentUserId: string;
}

// Explicit type for database story
type DBStory = {
  id: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

// Separate transformation function with explicit types
const transformDBStoryToStory = (dbStory: DBStory): Story => {
  return {
    id: dbStory.id,
    content: dbStory.content,
    media_url: dbStory.media_url,
    media_type: dbStory.media_type as Story['media_type'],
    created_at: dbStory.created_at,
    user: {
      id: dbStory.user_id,
      username: dbStory.profiles?.username ?? '',
      avatar_url: dbStory.profiles?.avatar_url
    }
  };
};

export function StoryViewer({ currentUserId }: StoryViewerProps) {
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number>(-1);
  const queryClient = useQueryClient();

  const fetchStories = async () => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        media_url,
        media_type,
        created_at,
        user_id,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('is_story', true)
      .gt('expires_at', now)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data as DBStory[]).map(transformDBStoryToStory);
  };

  const { data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: fetchStories
  });

  const handleStoryCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["stories"] });
  };

  const userStories = stories.filter(s => s.user.id === currentUserId);
  const friendStories = stories.filter(s => s.user.id !== currentUserId);
  const allStories = [...userStories, ...friendStories];

  return (
    <div className="mb-6">
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-4 p-4">
          {/* Create Story Button */}
          <div className="flex flex-col items-center space-y-1">
            <div 
              onClick={() => userStories.length ? setSelectedStoryIndex(0) : setIsCreatorOpen(true)}
              className="relative cursor-pointer group"
            >
              <Avatar className="w-16 h-16 border-2 border-muted p-1">
                <AvatarImage src={userStories[0]?.user.avatar_url || undefined} />
                <AvatarFallback>TU</AvatarFallback>
              </Avatar>
              {!userStories.length && (
                <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-background">
                  <Plus className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              Tu historia
            </span>
          </div>

          {/* Friend Stories */}
          {friendStories.map((story, index) => (
            <div 
              key={story.id}
              className="flex flex-col items-center space-y-1"
              onClick={() => setSelectedStoryIndex(userStories.length + index)}
            >
              <Avatar 
                className="w-16 h-16 ring-2 ring-primary p-1 cursor-pointer"
              >
                <AvatarImage src={story.user.avatar_url || undefined} />
                <AvatarFallback>{story.user.username[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[64px]">
                {story.user.username}
              </span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <StoryCreatorModal 
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onSuccess={handleStoryCreated}
      />

      <StoryView
        stories={allStories}
        initialStoryIndex={selectedStoryIndex}
        isOpen={selectedStoryIndex >= 0}
        onClose={() => setSelectedStoryIndex(-1)}
      />
    </div>
  );
}
