
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { StoryHeader } from "./StoryHeader";
import { StoryContent } from "./StoryContent";
import { StoryNavigation } from "./StoryNavigation";
import { StoryFooter } from "./StoryFooter";
import { StoryViewProps } from "./types";

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

  const handleReaction = async () => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      await supabase
        .from('reactions')
        .delete()
        .eq('post_id', currentStory.id)
        .eq('user_id', user.id);

      await supabase
        .from('reactions')
        .insert({
          post_id: currentStory.id,
          user_id: user.id,
          reaction_type: '❤️'
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

          <StoryHeader story={currentStory} onClose={onClose} />
          <StoryContent story={currentStory} />
          <StoryNavigation 
            onPrevious={handlePrevious}
            onNext={handleNext}
            isFirst={currentIndex === 0}
            isLast={currentIndex === stories.length - 1}
          />
          <StoryFooter 
            message={message}
            isSubmitting={isSubmitting}
            onMessageChange={setMessage}
            onSendMessage={handleSendMessage}
            onReaction={handleReaction}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
