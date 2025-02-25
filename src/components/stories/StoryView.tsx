
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Smile, Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Story {
  id: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  content: string;
  media_url: string | null;
  media_type: 'image' | 'audio' | null;
  created_at: string;
}

interface StoryViewProps {
  stories: Story[];
  initialStoryIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function StoryView({ stories, initialStoryIndex, isOpen, onClose }: StoryViewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 50);

      return () => clearInterval(timer);
    }
  }, [isOpen, currentIndex]);

  useEffect(() => {
    setCurrentIndex(initialStoryIndex);
  }, [initialStoryIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Primero eliminamos cualquier reacción existente
      await supabase
        .from('reactions')
        .delete()
        .eq('post_id', currentStory.id)
        .eq('user_id', user.id);

      // Luego insertamos la nueva reacción
      await supabase
        .from('reactions')
        .insert({
          post_id: currentStory.id,
          user_id: user.id,
          reaction_type: emoji
        });

      await queryClient.invalidateQueries({ queryKey: ["stories"] });

      toast({
        title: "Reacción enviada",
        description: "Tu reacción se ha enviado correctamente",
      });
    } catch (error) {
      console.error('Error al enviar reacción:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la reacción",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      await supabase.from('comments').insert({
        content: message.trim(),
        user_id: user.id,
        post_id: currentStory.id,
        is_story_reply: true
      });

      setMessage("");
      await queryClient.invalidateQueries({ queryKey: ["stories"] });

      toast({
        title: "Comentario enviado",
        description: "Tu comentario se ha enviado correctamente",
      });
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el comentario",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentStory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-md h-[90vh] p-0 gap-0">
        <div className="relative w-full h-full bg-black flex flex-col">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
            <div 
              className="h-full bg-white transition-all duration-50"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={currentStory.user.avatar_url || undefined} />
                <AvatarFallback>{currentStory.user.username[0]}</AvatarFallback>
              </Avatar>
              <div className="text-white">
                <p className="font-semibold">{currentStory.user.username}</p>
                <p className="text-xs opacity-75">
                  {new Date(currentStory.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center">
            {currentStory.media_type === 'image' && (
              <img
                src={currentStory.media_url || ''}
                alt="Story"
                className="max-h-full object-contain"
              />
            )}
            {currentStory.media_type === 'audio' && (
              <audio
                src={currentStory.media_url || ''}
                controls
                className="w-96 max-w-full"
              />
            )}
            {currentStory.content && (
              <p className="text-white text-xl font-medium p-4 text-center">
                {currentStory.content}
              </p>
            )}
          </div>

          {/* Navigation */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={handleNext}
            disabled={currentIndex === stories.length - 1}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Footer / Input */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => handleReaction('❤️')}
              disabled={isSubmitting}
            >
              <Smile className="h-6 w-6" />
            </Button>
            <Input
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Enviar comentario..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isSubmitting}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleSendMessage}
              disabled={!message.trim() || isSubmitting}
            >
              <Send className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
