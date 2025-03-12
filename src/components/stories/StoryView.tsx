
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface StoryViewProps {
  storyId: string;
  onClose: () => void;
}

export function StoryView({ storyId, onClose }: StoryViewProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<{id: string, username: string, text: string}[]>([]);
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

  const handleSendComment = () => {
    if (!comment.trim()) return;
    
    // En una implementación real, aquí enviaríamos el comentario a la base de datos
    setComments([...comments, {
      id: Date.now().toString(),
      username: "Tú",
      text: comment
    }]);
    setComment("");
    
    toast({
      title: "Comentario enviado",
      description: "Tu comentario ha sido enviado con éxito",
    });
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    
    toast({
      title: isLiked ? "Me gusta eliminado" : "Historia gustada",
      description: isLiked 
        ? "Se ha eliminado tu reacción" 
        : "Has indicado que te gusta esta historia",
    });
  };
  
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
          className="flex-1 bg-black flex items-center justify-center relative"
          onClick={() => {
            if (!showComments) {
              setIsPaused(!isPaused);
            }
          }}
        >
          <img 
            src={storyData.imageUrl} 
            alt="Story" 
            className="max-h-full max-w-full object-contain" 
          />

          {/* Barra de reacciones */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-background/20 text-white hover:bg-background/40"
              onClick={(e) => {
                e.stopPropagation();
                toggleLike();
              }}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-background/20 text-white hover:bg-background/40"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
                setIsPaused(true);
              }}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Panel de comentarios */}
        {showComments && (
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-lg p-4 h-1/3 flex flex-col" 
               onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Comentarios</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowComments(false);
                setIsPaused(false);
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-3 space-y-2">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay comentarios aún. Sé el primero en comentar.
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <span className="font-semibold text-sm">{comment.username}:</span>
                    <span className="text-sm">{comment.text}</span>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Añade un comentario..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendComment();
                  }
                }}
              />
              <Button size="icon" onClick={handleSendComment}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
