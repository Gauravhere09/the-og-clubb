
import { useState, useEffect } from "react";
import { Post } from "@/types/post";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useJoinIdeaDialog(post: Post) {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [profession, setProfession] = useState("");
  const [isCurrentUserJoined, setIsCurrentUserJoined] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Verificar si el usuario actual está unido a la idea
  useEffect(() => {
    if (post.idea) {
      const checkCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          const userJoined = post.idea?.participants.some(p => p.user_id === user.id) || false;
          setIsCurrentUserJoined(userJoined);
        }
      };
      
      checkCurrentUser();
    }
  }, [post.idea]);

  const handleJoinIdea = async () => {
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

      if (!post.idea) {
        throw new Error("Esta publicación no contiene una idea");
      }

      try {
        // Actualizar la idea en la base de datos
        const updatedParticipants = [...(post.idea.participants || []), newParticipant];
        
        const updatedIdea = {
          ...post.idea,
          participants: updatedParticipants
        };
        
        // Type assertion para añadir la propiedad idea
        const updateData = {
          idea: updatedIdea
        } as any;
        
        const { error } = await supabase
          .from('posts')
          .update(updateData)
          .eq('id', post.id);
        
        if (error) throw error;
        
        // Actualizar el estado local
        setIsCurrentUserJoined(true);
        setIsJoinDialogOpen(false);
        
        toast({
          title: "¡Te has unido!",
          description: "Ahora eres parte de esta idea",
        });
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
    }
  };

  // Solo mostrar el botón "Unirme" si existe una idea y el usuario no está unido
  const showJoinButton = post.idea && !isCurrentUserJoined;

  return {
    isJoinDialogOpen,
    setIsJoinDialogOpen,
    profession,
    setProfession,
    isCurrentUserJoined,
    currentUserId,
    handleJoinIdea,
    showJoinButton
  };
}
