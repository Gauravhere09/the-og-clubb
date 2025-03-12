
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { StoryHeader } from "./StoryHeader";
import { StoryContent } from "./StoryContent";
import { StoryActions } from "./StoryActions";
import { StoryComments } from "./StoryComments";

interface StoryViewProps {
  storyId: string;
  onClose: () => void;
}

export function StoryView({ storyId, onClose }: StoryViewProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<{id: string, username: string, text: string}[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  
  // En una implementación real, aquí obtendríamos los datos de la historia
  // a partir de su ID. Por ahora, usamos datos de ejemplo.
  const storyData = {
    id: storyId,
    user: {
      id: `friend${storyId}`,
      username: storyId === "1" ? "Carlos" : storyId === "2" ? "Sofía" : "Diego",
      avatarUrl: null
    },
    // Simulamos múltiples imágenes
    imageUrls: [
      `https://picsum.photos/seed/${storyId}/800/1200`,
      `https://picsum.photos/seed/${storyId}1/800/1200`,
      `https://picsum.photos/seed/${storyId}2/800/1200`,
    ].slice(0, storyId === "1" ? 3 : storyId === "2" ? 2 : 1), // Diferente número de imágenes por historia
    createdAt: new Date().toISOString()
  };
  
  // Calcular el tiempo transcurrido desde la creación
  const timeAgo = new Date().getTime() - new Date(storyData.createdAt).getTime();
  const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
  const minutesAgo = Math.floor((timeAgo % (1000 * 60 * 60)) / (1000 * 60));
  
  const timeDisplay = hoursAgo > 0 
    ? `Hace ${hoursAgo}h ${minutesAgo}m` 
    : `Hace ${minutesAgo}m`;

  // Reset progress when changing images
  useEffect(() => {
    setProgress(0);
  }, [currentImageIndex]);

  // Gestionar la barra de progreso
  useEffect(() => {
    if (isPaused) return;

    const duration = 5000; // 5 segundos por imagen
    const interval = 100; // actualizar cada 100ms
    const increment = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          
          // Si hay más imágenes, pasar a la siguiente
          if (currentImageIndex < storyData.imageUrls.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
            return 0; // Reiniciar progreso para la siguiente imagen
          } else {
            // Si es la última imagen, cerrar el visor después de un momento
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
    // En una implementación real, aquí enviaríamos el comentario a la base de datos
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
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="p-0 max-w-md h-[80vh] max-h-[600px] flex flex-col">
        <StoryHeader 
          username={storyData.user.username}
          avatarUrl={storyData.user.avatarUrl}
          timeDisplay={timeDisplay}
          progress={progress}
          currentImageIndex={currentImageIndex}
          totalImages={storyData.imageUrls.length}
          onClose={onClose}
        />
        
        <StoryContent 
          imageUrls={storyData.imageUrls}
          currentImageIndex={currentImageIndex}
          onContentClick={handleContentClick}
          onNextImage={handleNextImage}
          onPrevImage={handlePrevImage}
        />

        <StoryActions 
          isLiked={isLiked}
          toggleLike={toggleLike}
          toggleComments={toggleComments}
        />

        {showComments && (
          <StoryComments 
            comments={comments}
            onSendComment={handleSendComment}
            onClose={() => {
              setShowComments(false);
              setIsPaused(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
