
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
import { Pause, Play, Trash2 } from "lucide-react";
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
            "p-0 max-w-md h-[80vh] max-h-[600px] flex flex-col",
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
              className="absolute bottom-16 left-0 right-0 px-4 py-2 bg-background/30 backdrop-blur-sm"
            />
          )}

          <div className="absolute right-4 top-16 z-20 flex flex-col gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="bg-background/20 text-foreground hover:bg-background/40"
              onClick={togglePause}
              title={isPaused ? "Reanudar" : "Pausar"}
            >
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </Button>
            
            {canDeleteStory && (
              <Button
                size="icon"
                variant="ghost"
                className="bg-background/20 text-destructive hover:bg-destructive/20"
                onClick={() => setShowDeleteConfirm(true)}
                title="Eliminar historia"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>

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
