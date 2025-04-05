
import { useState, useEffect } from "react";
import { Idea, IdeaParticipant } from "@/types/post";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useIdeaJoin(idea: Idea, postId: string) {
  const [participants, setParticipants] = useState<IdeaParticipant[]>(idea.participants || []);
  const [isCurrentUserJoined, setIsCurrentUserJoined] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (idea && idea.participants) {
      setParticipants(idea.participants);
    }
  }, [idea]);

  // Verificar si el usuario actual está unido a la idea
  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const userJoined = participants.some(p => p.user_id === user.id) || false;
        setIsCurrentUserJoined(userJoined);
      }
    };
    
    checkCurrentUser();
  }, [participants]);

  const handleJoinIdea = async (profession: string) => {
    if (!profession.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes ingresar tu profesión",
      });
      return;
    }

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

      // Obtener los datos del perfil del usuario
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      // Crear un nuevo participante
      const newParticipant = {
        user_id: user.id,
        profession: profession.trim(),
        joined_at: new Date().toISOString(),
        username: profileData?.username || undefined,
        avatar_url: profileData?.avatar_url || undefined
      };

      // Actualizar la idea en la base de datos
      const updatedParticipants = [...participants, newParticipant];
      
      const updatedIdea = {
        ...idea,
        participants: updatedParticipants
      };
      
      // Type assertion para añadir la propiedad idea
      const updateData = {
        idea: updatedIdea
      } as any;
      
      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId);
      
      if (error) throw error;
      
      // Actualizar el estado local
      setParticipants(updatedParticipants);
      setIsCurrentUserJoined(true);
      setIsJoinDialogOpen(false);
      
      toast({
        title: "¡Te has unido!",
        description: "Ahora eres parte de esta idea",
      });
    } catch (error) {
      console.error("Error al unirse a la idea:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo unir a la idea. Intenta nuevamente.",
      });
    }
  };

  return {
    participants,
    isCurrentUserJoined,
    isJoinDialogOpen,
    setIsJoinDialogOpen,
    handleJoinIdea
  };
}
