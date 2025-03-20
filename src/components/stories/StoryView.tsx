import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { StoryHeader } from "./StoryHeader";
import { StoryContent } from "./StoryContent";
import { StoryActions } from "./StoryActions";
import { StoryComments } from "./StoryComments";
import { cn } from "@/lib/utils";
import { StoryReaction } from "./StoryReaction";
import { StoryReactionSummary } from "./StoryReactionSummary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStory } from "@/hooks/use-story";
import { StoryProgress } from "./StoryProgress";
import { useStoryComments } from "@/hooks/use-story-comments";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Pause, Play } from "lucide-react";
import { Button } from "../ui/button";

interface StoryViewProps {
  storyId: string;
  onClose: () => void;
}

export function StoryView({ storyId, onClose }: StoryViewProps) {
  
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  
  const { storyData, timeDisplay } = useStory(storyId);
  const { progress } = StoryProgress({ 
    isPaused, 
    currentImageIndex, 
    totalImages: storyData.imageUrls.length,
    onComplete: handleClose,
    onImageComplete: () => setCurrentImageIndex(prev => prev + 1)
  });
  
  const { 
    comments, 
    showComments, 
    handleSendComment, 
    toggleComments, 
    setShowComments 
  } = useStoryComments();
  
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  function handleClose() {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const toggleReactions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReactions(!showReactions);
    setIsPaused(true);
  };

  const togglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(!isPaused);
  };

  const handleContentClick = () => {
    if (!showComments && !showReactions) {
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

  const handleDeleteStory = async () => {
    try {
      // Only allow deletion if this is the user's own story
      if (currentUser?.id !== storyData.user.id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Solo puedes eliminar tus propias historias",
        });
        return;
      }

      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;

      toast({
        title: "Historia eliminada",
        description: "Tu historia ha sido eliminada correctamente",
      });
      
      handleClose();
    } catch (error) {
      console.error("Error deleting story:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la historia",
      });
    }
    setShowDeleteConfirm(false);
  };
  
  const canDeleteStory = currentUser?.id === storyData.user.id;
  
  return (
    <>
      <Dialog open={true} onOpenChange={() => handleClose()}>
        <DialogContent 
          className={cn(
            "p-0 max-w-md h-[80vh] max-h-[600px] flex flex-col bg-black",
            "animate-in fade-in-0 zoom-in-95 duration-300",
            isExiting && "animate-out fade-out-0 zoom-out-95 duration-300"
          )}
          aria-describedby="story-dialog-description"
        >
          <DialogTitle className="sr-only">Ver historia</DialogTitle>
          <span id="story-dialog-description" className="sr-only">
            Contenido de la historia de {storyData.user.username}
          </span>
          
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

          <div className="absolute bottom-20 left-4 z-10">
            <StoryReactionSummary storyId={storyId} />
          </div>

          {currentUser && (
            <StoryReaction 
              storyId={storyId}
              userId={currentUser.id}
              showReactions={showReactions}
              className="absolute bottom-24 left-0 right-0 px-4 py-2"
            />
          )}

          <div className="absolute right-4 top-16 z-20">
            <Button
              size="icon"
              variant="ghost"
              className="bg-black/50 text-white hover:bg-black/70"
              onClick={togglePause}
              title={isPaused ? "Reanudar" : "Pausar"}
            >
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </Button>
          </div>

          <div className="absolute left-0 right-0 bottom-0">
            <form className="flex items-center px-4 py-2 bg-black/80 backdrop-blur-sm">
              <input
                type="text"
                placeholder="Responder..."
                className="w-full bg-transparent text-white border-none focus:outline-none placeholder:text-gray-400"
                onClick={() => setIsPaused(true)}
              />
            </form>
          </div>

          <StoryActions 
            isLiked={isLiked}
            toggleLike={toggleLike}
            toggleComments={toggleComments}
            toggleReactions={toggleReactions}
            onDeleteStory={() => setShowDeleteConfirm(true)}
            canDelete={canDeleteStory}
            className={cn(
              "absolute bottom-12 left-0 right-0 animate-in slide-in-from-bottom duration-300",
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

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta historia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La historia será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteStory} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
