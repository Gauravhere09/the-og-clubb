
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Upload } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { StoryCreator } from "./StoryCreator";
import { StoriesList } from "./StoriesList";
import { StoryView } from "./StoryView";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StoryViewerProps {
  currentUserId: string;
}

export function StoryViewer({ currentUserId }: StoryViewerProps) {
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [viewingStory, setViewingStory] = useState<string | null>(null);

  // Obtener las historias de la base de datos
  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      // Obtener todas las historias que no han expirado
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select(`
          id,
          user_id,
          created_at
        `)
        .gte('expires_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching stories:", error);
        return [];
      }
      
      // Get profiles for each user that has stories
      const userIds = [...new Set(storiesData.map(story => story.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return [];
      }
      
      const profilesMap = new Map(profiles.map(profile => [profile.id, profile]));
      
      // Obtener las vistas de historias para el usuario actual
      const { data: views, error: viewsError } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('viewer_id', currentUserId);
        
      if (viewsError) {
        console.error("Error fetching story views:", viewsError);
        return [];
      }
      
      const viewedStoryIds = new Set(views.map(view => view.story_id));
      
      // Agrupar historias por usuario
      const userStories: Record<string, { 
        userId: string, 
        username: string, 
        avatarUrl: string | null,
        storyIds: string[],
        hasUnseenStories: boolean 
      }> = {};
      
      storiesData.forEach(story => {
        const userId = story.user_id;
        const isViewed = viewedStoryIds.has(story.id);
        const profile = profilesMap.get(userId);
        
        if (!userStories[userId]) {
          userStories[userId] = {
            userId,
            username: profile?.username || 'Usuario',
            avatarUrl: profile?.avatar_url,
            storyIds: [story.id],
            hasUnseenStories: !isViewed
          };
        } else {
          userStories[userId].storyIds.push(story.id);
          if (!isViewed) {
            userStories[userId].hasUnseenStories = true;
          }
        }
      });
      
      // Convertir el objeto a un array para la UI
      return Object.values(userStories).map(user => ({
        id: user.storyIds[0], // Usamos el primer ID de historia como referencia
        userId: user.userId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        hasUnseenStories: user.hasUnseenStories
      }));
    },
    refetchInterval: 60000 // Refrescar cada minuto
  });

  // Verificar si el usuario actual tiene historias
  const userStory = stories.find(story => story.userId === currentUserId);
  
  // Agregar placeholder para "Crear historia" si no hay datos aún
  const allStories = isLoading
    ? [
        { 
          id: "0", 
          userId: currentUserId, 
          username: "Tu", 
          avatarUrl: null, 
          hasUnseenStories: false 
        }
      ]
    : stories;

  return (
    <div className="mb-6">
      {showStoryCreator && (
        <StoryCreator 
          onClose={() => setShowStoryCreator(false)} 
          currentUserId={currentUserId}
        />
      )}
      
      {viewingStory && (
        <StoryView 
          storyId={viewingStory}
          onClose={() => setViewingStory(null)}
        />
      )}
      
      <div className="flex w-max space-x-4 p-4 overflow-x-auto">
        <TooltipProvider>
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex flex-col items-center space-y-1">
                <div className="relative cursor-pointer group">
                  <Avatar className={`w-16 h-16 border-2 ${userStory ? 'border-primary' : 'border-muted'} p-1`}>
                    <AvatarFallback>TU</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-background">
                    {userStory ? (
                      <Eye className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Upload className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {userStory ? 'Tu historia' : 'Crear historia'}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="flex flex-col gap-1">
                {!userStory && (
                  <button
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-sm"
                    onClick={() => setShowStoryCreator(true)}
                  >
                    <Upload className="h-4 w-4" />
                    Subir historia
                  </button>
                )}
                
                {userStory && (
                  <button
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-sm"
                    onClick={() => setViewingStory(userStory.id)}
                  >
                    <Eye className="h-4 w-4" />
                    Ver tu historia
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </TooltipProvider>

        <StoriesList 
          stories={allStories.filter(story => story.userId !== currentUserId)} 
          onStoryClick={(storyId) => setViewingStory(storyId)}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
