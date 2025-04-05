
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Camera, ChevronRight } from "lucide-react";
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
      // Modified query to not try to join with profiles directly
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          image_url,
          created_at,
          user_id,
          media_type
        `)
        .in('user_id', userIds)
        .gte('expires_at', now)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get user profiles separately
      const uniqueUserIds = [...new Set(data?.map(story => story.user_id) || [])];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', uniqueUserIds);
      
      if (profilesError) throw profilesError;
      
      // Create a map for easier profile lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
      
      // Get story views to mark seen stories
      const { data: viewsData } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('viewer_id', currentUserId);
      
      const viewedStoryIds = viewsData ? viewsData.map(v => v.story_id) : [];
      
      // Group stories by user
      const usersMap = new Map();
      
      if (data) {
        data.forEach(story => {
          const userId = story.user_id;
          const profile = profilesMap.get(userId);
          
          if (!usersMap.has(userId)) {
            usersMap.set(userId, {
              userId,
              username: profile?.username || 'Usuario',
              avatarUrl: profile?.avatar_url || null,
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
      }
      
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
      <div className="p-3 overflow-x-auto">
        <div className="flex space-x-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="min-w-[110px] h-[190px] rounded-lg bg-muted animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="p-3 overflow-x-auto">
        <div className="flex space-x-3">
          {/* Create story button */}
          <div 
            className="min-w-[110px] h-[190px] rounded-lg border border-border overflow-hidden cursor-pointer relative group"
            onClick={handleCreateStory}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10"></div>
            <div className="h-2/3 bg-muted flex items-center justify-center">
              <Plus className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto mb-1">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs text-center font-medium">Crear historia</p>
            </div>
          </div>
          
          {/* User stories */}
          {stories.map((user) => (
            <div 
              key={user.userId}
              className="min-w-[110px] h-[190px] rounded-lg overflow-hidden cursor-pointer relative group"
              onClick={() => handleStoryClick(user.storyIds[0])}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10"></div>
              
              {/* Story preview (could be an image or color) */}
              <div className="h-full bg-gradient-to-br from-blue-500 to-purple-600">
                {/* This could be replaced with an actual story preview image if available */}
              </div>
              
              {/* User info at the bottom */}
              <div className="absolute top-3 left-3 z-20">
                <div className={`w-10 h-10 rounded-full ${user.hasUnviewed ? 'border-2 border-primary p-[2px]' : ''} bg-background flex items-center justify-center`}>
                  <img 
                    src={user.avatarUrl || "/placeholder.svg"}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                <p className="text-xs text-white text-center font-medium">{user.username}</p>
              </div>
            </div>
          ))}
          
          {stories.length === 0 && !isLoading && (
            <div className="min-w-[110px] h-[190px] rounded-lg border border-border flex flex-col items-center justify-center p-3">
              <Camera className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-xs text-center text-muted-foreground">No hay historias disponibles</p>
            </div>
          )}
          
          {/* Show more button when there are many stories */}
          {stories.length > 3 && (
            <Button 
              variant="secondary" 
              size="icon" 
              className="self-center h-10 w-10 rounded-full absolute right-3 top-1/2 transform -translate-y-1/2 z-30 shadow-md"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
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
