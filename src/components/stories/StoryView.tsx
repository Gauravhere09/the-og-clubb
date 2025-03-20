
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
import { Pause, Play, MoreHorizontal, Link, Trash2, Bug } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StoryViewProps {
  storyId: string;
  onClose: () => void;
}

export function StoryView({ storyId, onClose }: StoryViewProps) {
  
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  
  const { storyData, timeDisplay } = useStory(storyId);
  const { progress } = StoryProgress({ 
    isPaused, 
    currentImageIndex: currentMediaIndex, 
    totalImages: storyData.mediaItems.length || 1,
    onComplete: handleClose,
    onImageComplete: () => setCurrentMediaIndex(prev => prev + 1)
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

  const toggleReactionsPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReactions(!showReactions);
    setIsPaused(true);
  };

  const togglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(!isPaused);
  };

  const handleCommentsToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleComments(e);
    setIsPaused(true);
  };

  const handleContentClick = () => {
    if (!showComments && !showReactions) {
      setIsPaused(!isPaused);
    }
  };
  
  const handleNextMedia = () => {
    if (currentMediaIndex < storyData.mediaItems.length - 1) {
      setCurrentMediaIndex(prev => prev + 1);
    }
  };
  
  const handlePrevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1);
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
            currentImageIndex={currentMediaIndex}
            totalImages={storyData.mediaItems.length || 1}
            onClose={handleClose}
          />
          
          {/* Top right controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-black/50 text-white hover:bg-black/70"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 text-white border-gray-800 dark:bg-gray-900 w-72 p-0">
                <DropdownMenuItem className="py-3 px-4 hover:bg-gray-800 cursor-pointer flex items-center gap-3 text-white dark:text-white">
                  <Link className="h-5 w-5" />
                  <div className="flex flex-col">
                    <span className="font-medium">Copiar enlace para compartir esta historia</span>
                    <span className="text-xs text-gray-400">La audiencia podrá ver tu historia durante 24 horas.</span>
                  </div>
                </DropdownMenuItem>
                
                {canDeleteStory && (
                  <DropdownMenuItem 
                    className="py-3 px-4 hover:bg-gray-800 cursor-pointer flex items-center gap-3 text-red-400"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="font-medium">Eliminar historia</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem className="py-3 px-4 hover:bg-gray-800 cursor-pointer flex items-center gap-3 text-white dark:text-white">
                  <Bug className="h-5 w-5" />
                  <span className="font-medium">Algo no funciona</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
          
          <StoryContent 
            mediaItems={storyData.mediaItems || []}
            currentIndex={currentMediaIndex}
            onContentClick={handleContentClick}
            onNextImage={handleNextMedia}
            onPrevImage={handlePrevMedia}
            isPaused={isPaused}
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

          <div className="absolute left-0 right-0 bottom-0">
            <form className="flex items-center px-4 py-2 bg-black/80 backdrop-blur-sm">
              <input
                type="text"
                placeholder="Responder..."
                className="w-full bg-transparent text-white border-none focus:outline-none placeholder:text-gray-400"
                onClick={() => {
                  setIsPaused(true);
                  setShowComments(true);
                }}
              />
            </form>
          </div>

          <StoryActions 
            toggleComments={handleCommentsToggle}
            toggleReactions={toggleReactionsPanel}
            onDeleteStory={() => setShowDeleteConfirm(true)}
            canDelete={canDeleteStory}
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
