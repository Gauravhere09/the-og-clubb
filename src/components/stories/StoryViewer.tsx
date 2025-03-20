
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Camera } from "lucide-react";
import { StoryCreator } from "./StoryCreator";
import { supabase } from "@/integrations/supabase/client";
import { UserStoryButton } from "./UserStoryButton";
import { StoryView } from "./StoryView";
import { cleanupExpiredStories } from "./utils/story-utils";

interface StoryViewerProps {
  currentUserId: string;
}

export function StoryViewer({ currentUserId }: StoryViewerProps) {
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [viewStoryId, setViewStoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchStories();
    
    // Limpiar historias expiradas al cargar el componente
    cleanupExpiredStories().then(count => {
      if (count > 0) {
        console.log(`Se eliminaron ${count} historias expiradas`);
      }
    });
    
    // Configurar una subscripción a cambios en la tabla de historias
    const subscription = supabase
      .channel('stories-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'stories' 
      }, () => {
        fetchStories();
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId]);
  
  const fetchStories = async () => {
    setIsLoading(true);
    try {
      // Primero, eliminar historias expiradas
      await cleanupExpiredStories();
      
      // Luego obtener historias válidas
      const now = new Date().toISOString();
      
      // Get user's friends
      const { data: friendsData } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', currentUserId)
        .eq('status', 'accepted');
      
      const friendIds = friendsData ? friendsData.map(f => f.friend_id) : [];
      
      // Include current user and friends
      const userIds = [currentUserId, ...friendIds];
      
      // Get stories from these users, excluding expired ones
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          image_url,
          created_at,
          user_id,
          media_type,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .in('user_id', userIds)
        .gte('expires_at', now)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get story views to mark seen stories
      const { data: viewsData } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('viewer_id', currentUserId);
      
      const viewedStoryIds = viewsData ? viewsData.map(v => v.story_id) : [];
      
      // Group stories by user
      const usersMap = new Map();
      
      data?.forEach(story => {
        const userId = story.user_id;
        
        if (!usersMap.has(userId)) {
          usersMap.set(userId, {
            userId,
            username: story.profiles?.username || 'Usuario',
            avatarUrl: story.profiles?.avatar_url,
            hasUnviewed: false,
            storyIds: []
          });
        }
        
        const user = usersMap.get(userId);
        user.storyIds.push(story.id);
        
        // Mark if user has any unviewed stories
        if (!viewedStoryIds.includes(story.id)) {
          user.hasUnviewed = true;
        }
      });
      
      // Order by: current user first, then users with unseen stories, then rest
      const userStories = Array.from(usersMap.values());
      
      userStories.sort((a, b) => {
        // Current user goes first
        if (a.userId === currentUserId) return -1;
        if (b.userId === currentUserId) return 1;
        
        // Then users with unseen stories
        if (a.hasUnviewed && !b.hasUnviewed) return -1;
        if (!a.hasUnviewed && b.hasUnviewed) return 1;
        
        return 0;
      });
      
      setStories(userStories);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateStory = () => {
    setIsCreatorOpen(true);
  };
  
  const handleCloseCreator = () => {
    setIsCreatorOpen(false);
    fetchStories();
  };
  
  const handleStoryClick = (storyId: string) => {
    setViewStoryId(storyId);
  };
  
  const handleCloseStory = () => {
    setViewStoryId(null);
    fetchStories();
  };
  
  if (isLoading) {
    return (
      <div className="p-4 overflow-x-auto">
        <div className="flex space-x-3">
          <div className="w-16 h-16 rounded-full bg-muted animate-pulse"></div>
          <div className="w-16 h-16 rounded-full bg-muted animate-pulse"></div>
          <div className="w-16 h-16 rounded-full bg-muted animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="p-4 overflow-x-auto">
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={handleCreateStory}
            className="w-16 h-16 rounded-full p-0 bg-muted/50 hover:bg-muted border border-border flex-shrink-0"
          >
            <div className="flex flex-col items-center justify-center">
              <Plus className="h-5 w-5 mb-1" />
              <span className="text-xs">Historia</span>
            </div>
          </Button>
          
          {stories.map((user) => (
            <UserStoryButton
              key={user.userId}
              username={user.username}
              avatarUrl={user.avatarUrl}
              onClick={() => handleStoryClick(user.storyIds[0])}
              hasUnviewed={user.hasUnviewed}
            />
          ))}
          
          {stories.length === 0 && !isLoading && (
            <div className="flex items-center justify-center p-3 text-sm text-muted-foreground">
              <Camera className="h-4 w-4 mr-2" />
              <span>No hay historias disponibles</span>
            </div>
          )}
        </div>
      </div>
      
      {isCreatorOpen && (
        <StoryCreator onClose={handleCloseCreator} currentUserId={currentUserId} />
      )}
      
      {viewStoryId && (
        <StoryView 
          storyId={viewStoryId} 
          onClose={handleCloseStory} 
          userId={currentUserId}
        />
      )}
    </>
  );
}
