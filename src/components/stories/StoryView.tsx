
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { StoryHeader } from "./StoryHeader";
import { StoryContent } from "./StoryContent";
import { StoryActions } from "./StoryActions";
import { StoryComments } from "./StoryComments";
import { cn } from "@/lib/utils";
import { StoryReaction } from "./StoryReaction";
import { StoryReactionSummary } from "./StoryReactionSummary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StoryViewProps {
  storyId: string;
  onClose: () => void;
}

export function StoryView({ storyId, onClose }: StoryViewProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [comments, setComments] = useState<{id: string, username: string, text: string}[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const { toast } = useToast();
  
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
  
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });
  
  const timeAgo = new Date().getTime() - new Date(displayData.createdAt).getTime();
  const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
  const minutesAgo = Math.floor((timeAgo % (1000 * 60 * 60)) / (1000 * 60));
  
  const timeDisplay = hoursAgo > 0 
    ? `Hace ${hoursAgo}h ${minutesAgo}m` 
    : `Hace ${minutesAgo}m`;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    setProgress(0);
  }, [currentImageIndex]);

  useEffect(() => {
    if (isPaused) return;

    const duration = 5000;
    const interval = 100;
    const increment = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          
          if (currentImageIndex < displayData.imageUrls.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
            return 0;
          } else {
            setTimeout(() => {
              onClose();
            }, 300);
            return 100;
          }
        }
        return newProgress;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [isPaused, onClose, currentImageIndex, displayData.imageUrls.length]);

  const handleSendComment = (commentText: string) => {
    setComments([...comments, {
      id: Date.now().toString(),
      username: "Tú",
      text: commentText
    }]);
    
    toast({
      title: "Comentario enviado",
      description: "Tu comentario ha sido enviado con éxito",
    });
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    
    toast({
      title: isLiked ? "Me gusta eliminado" : "Historia gustada",
      description: isLiked 
        ? "Se ha eliminado tu reacción" 
        : "Has indicado que te gusta esta historia",
    });
  };

  const toggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(!showComments);
    setIsPaused(true);
  };

  const toggleReactions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReactions(!showReactions);
    setIsPaused(true);
  };

  const handleContentClick = () => {
    if (!showComments && !showReactions) {
      setIsPaused(!isPaused);
    }
  };
  
  const handleNextImage = () => {
    if (currentImageIndex < displayData.imageUrls.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };
  
  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={() => handleClose()}>
      <DialogContent 
        className={cn(
          "p-0 max-w-md h-[80vh] max-h-[600px] flex flex-col",
          "animate-in fade-in-0 zoom-in-95 duration-300",
          isExiting && "animate-out fade-out-0 zoom-out-95 duration-300"
        )}
        aria-describedby="story-dialog-description"
      >
        <DialogTitle className="sr-only">Ver historia</DialogTitle>
        <span id="story-dialog-description" className="sr-only">
          Contenido de la historia de {displayData.user.username}
        </span>
        
        <StoryHeader 
          username={displayData.user.username}
          avatarUrl={displayData.user.avatarUrl}
          timeDisplay={timeDisplay}
          progress={progress}
          currentImageIndex={currentImageIndex}
          totalImages={displayData.imageUrls.length}
          onClose={handleClose}
        />
        
        <StoryContent 
          imageUrls={displayData.imageUrls}
          currentImageIndex={currentImageIndex}
          onContentClick={handleContentClick}
          onNextImage={handleNextImage}
          onPrevImage={handlePrevImage}
          className={cn(
            "animate-in fade-in-0 duration-300",
            isExiting && "animate-out fade-out-0 duration-300"
          )}
        />

        <div className="absolute bottom-20 left-4 z-10">
          <StoryReactionSummary storyId={storyId} />
        </div>

        {currentUser && (
          <StoryReaction 
            storyId={storyId}
            userId={currentUser.id}
            showReactions={showReactions}
            className="absolute bottom-16 left-0 right-0 px-4 py-2 bg-background/30 backdrop-blur-sm"
          />
        )}

        <StoryActions 
          isLiked={isLiked}
          toggleLike={toggleLike}
          toggleComments={toggleComments}
          toggleReactions={toggleReactions}
          className={cn(
            "animate-in slide-in-from-bottom duration-300",
            isExiting && "animate-out slide-out-to-bottom duration-300"
          )}
        />

        {showComments && (
          <StoryComments 
            comments={comments}
            onSendComment={handleSendComment}
            onClose={() => {
              setShowComments(false);
              setIsPaused(false);
            }}
            className="animate-in slide-in-from-bottom duration-300"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
