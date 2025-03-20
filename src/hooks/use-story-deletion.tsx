
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseStoryDeletionProps {
  storyId: string;
  userId?: string;
  ownerId?: string;
  onClose: () => void;
}

export function useStoryDeletion({ 
  storyId, 
  userId, 
  ownerId,
  onClose 
}: UseStoryDeletionProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  
  const canDeleteStory = userId === ownerId;
  
  const handleDeleteStory = async () => {
    try {
      // Only allow deletion if this is the user's own story
      if (!canDeleteStory) {
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
      
      onClose();
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

  return {
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeleteStory,
    canDeleteStory
  };
}
