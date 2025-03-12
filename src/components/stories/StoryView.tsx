
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoryViewProps {
  storyId: string;
  onClose: () => void;
}

export function StoryView({ storyId, onClose }: StoryViewProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // En una implementación real, aquí obtendríamos los datos de la historia
  // a partir de su ID. Por ahora, usamos datos de ejemplo.
  const storyData = {
    id: storyId,
    user: {
      id: `friend${storyId}`,
      username: storyId === "1" ? "Carlos" : storyId === "2" ? "Sofía" : "Diego",
      avatarUrl: null
    },
    imageUrl: "https://picsum.photos/seed/" + storyId + "/800/1200",
    createdAt: new Date().toISOString()
  };
  
  // Calcular el tiempo transcurrido desde la creación
  const timeAgo = new Date().getTime() - new Date(storyData.createdAt).getTime();
  const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
  const minutesAgo = Math.floor((timeAgo % (1000 * 60 * 60)) / (1000 * 60));
  
  const timeDisplay = hoursAgo > 0 
    ? `Hace ${hoursAgo}h ${minutesAgo}m` 
    : `Hace ${minutesAgo}m`;

  // Gestionar la barra de progreso
  useEffect(() => {
    if (isPaused) return;

    const duration = 5000; // 5 segundos por historia
    const interval = 100; // actualizar cada 100ms
    const increment = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          // En una implementación real, aquí pasaríamos a la siguiente historia
          // o cerraríamos el visor si es la última
          setTimeout(() => {
            onClose();
          }, 300);
          return 100;
        }
        return newProgress;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [isPaused, onClose]);
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="p-0 max-w-md h-[80vh] max-h-[600px] flex flex-col">
        {/* Cabecera de la historia */}
        <div className="p-4 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-background/80 to-transparent">
          <div className="w-full bg-background/30 h-1 rounded-full mb-3">
            <div 
              className="bg-primary h-1 rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={storyData.user.avatarUrl || undefined} />
                <AvatarFallback>{storyData.user.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {storyData.user.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeDisplay}
                </span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-foreground"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Contenido de la historia */}
        <div 
          className="flex-1 bg-black flex items-center justify-center"
          onClick={() => setIsPaused(!isPaused)}
        >
          <img 
            src={storyData.imageUrl} 
            alt="Story" 
            className="max-h-full max-w-full object-contain" 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
