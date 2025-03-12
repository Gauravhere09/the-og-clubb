import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { StoryHeader } from "./StoryHeader";
import { StoryContent } from "./StoryContent";
import { StoryActions } from "./StoryActions";
import { StoryComments } from "./StoryComments";
import { cn } from "@/lib/utils";

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
  const { toast } = useToast();
  
  const storyData = {
    id: storyId,
    user: {
      id: `friend${storyId}`,
      username: storyId === "1" ? "Carlos" : storyId === "2" ? "Sofía" : "Diego",
      avatarUrl: null
    },
    imageUrls: [
      `https://picsum.photos/seed/${storyId}/800/1200`,
      `https://picsum.photos/seed/${storyId}1/800/1200`,
      `https://picsum.photos/seed/${storyId}2/800/1200`,
    ].slice(0, storyId === "1" ? 3 : storyId === "2" ? 2 : 1),
    createdAt: new Date().toISOString()
  };
  
  const timeAgo = new Date().getTime() - new Date(storyData.createdAt).getTime();
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
          
          if (currentImageIndex < storyData.imageUrls.length - 1) {
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
  }, [isPaused, onClose, currentImageIndex, storyData.imageUrls.length]);

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

  const handleContentClick = () => {
    if (!showComments) {
      setIsPaused(!isPaused);
    }
  };
  
  const handleNextImage = () => {
    if (currentImageIndex < storyData.imageUrls.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };
  
  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent 
        className={cn(
          "p-0 max-w-md h-[80vh] max-h-[600px] flex flex-col",
          "animate-in fade-in-0 zoom-in-95 duration-300",
          isExiting && "animate-out fade-out-0 zoom-out-95 duration-300"
        )}
      >
        <StoryHeader 
          username={storyData.user.username}
          avatarUrl={storyData.user.avatarUrl}
          timeDisplay={timeDisplay}
          progress={progress}
          currentImageIndex={currentImageIndex}
          totalImages={storyData.imageUrls.length}
          onClose={handleClose}
        />
        
        <StoryContent 
          imageUrls={storyData.imageUrls}
          currentImageIndex={currentImageIndex}
          onContentClick={handleContentClick}
          onNextImage={handleNextImage}
          onPrevImage={handlePrevImage}
          className={cn(
            "animate-in fade-in-0 duration-300",
            isExiting && "animate-out fade-out-0 duration-300"
          )}
        />

        <StoryActions 
          isLiked={isLiked}
          toggleLike={toggleLike}
          toggleComments={toggleComments}
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
