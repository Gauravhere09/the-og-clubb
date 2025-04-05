
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { IdeaParticipant } from "@/types/post";
import { useToast } from "@/hooks/use-toast";

export function useIdeaJoin(idea: any, postId: string) {
  const [participants, setParticipants] = useState<IdeaParticipant[]>(idea.participants || []);
  const [isCurrentUserJoined, setIsCurrentUserJoined] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const { toast } = useToast();

  // Check if current user is joined
  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const userJoined = participants.some(p => p.user_id === user.id);
        setIsCurrentUserJoined(userJoined);
      }
    };
    
    checkCurrentUser();
  }, [participants]);

  const handleJoinIdea = async (profession: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para unirte a una idea",
        });
        return;
      }

      // Get user profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      // Create new participant
      const newParticipant: IdeaParticipant = {
        user_id: user.id,
        profession,
        joined_at: new Date().toISOString(),
        username: profileData?.username || undefined,
        avatar_url: profileData?.avatar_url || undefined
      };

      // Update idea in database
      const updatedParticipants = [...participants, newParticipant];
      
      try {
        // Get current post to update it
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();
        
        if (error) {
          throw new Error("No se pudo obtener la publicación");
        }
        
        if (data) {
          // Create updated idea object with type assertion
          const updatedIdea = {
            ...idea,
            participants: updatedParticipants
          };
          
          // Use type assertion for the update operation
          const updateData = {
            idea: updatedIdea
          } as any;
          
          const { error: updateError } = await supabase
            .from('posts')
            .update(updateData)
            .eq('id', postId);
          
          if (updateError) throw updateError;
          
          // Update local state
          setParticipants(updatedParticipants);
          setIsCurrentUserJoined(true);
          setIsJoinDialogOpen(false);
          
          toast({
            title: "¡Te has unido!",
            description: "Ahora eres parte de esta idea",
          });
        }
      } catch (error) {
        console.error("Error al actualizar la idea:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error al unirse a la idea:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo unir a la idea. Intenta nuevamente.",
      });
      throw error;
    }
  };

  return {
    participants,
    isCurrentUserJoined,
    currentUserId,
    isJoinDialogOpen,
    setIsJoinDialogOpen,
    handleJoinIdea
  };
}
