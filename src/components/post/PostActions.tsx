
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Post } from "@/types/post";
import { type ReactionType } from "./reactions/ReactionIcons";
import { ShareOptions } from "./actions/ShareOptions";
import { ReactionSummaryDialog } from "./actions/ReactionSummaryDialog";
import { CommentsCount } from "./actions/CommentsCount";
import { CommentButton } from "./actions/CommentButton";
import { LongPressReactionButton } from "./reactions/LongPressReactionButton";
import { Share, Briefcase } from "lucide-react";
import { useLongPress } from "./reactions/hooks/use-long-press";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PostActionsProps {
  post: Post;
  onReaction: (type: ReactionType) => void;
  onToggleComments: () => void;
  onCommentsClick: () => void;
  commentsExpanded?: boolean;
}

export function PostActions({ 
  post, 
  onReaction, 
  onToggleComments,
  onCommentsClick,
  commentsExpanded = false
}: PostActionsProps) {
  const reactionsByType = post.reactions?.by_type || {};
  const userReaction = post.user_reaction as ReactionType | undefined;
  const totalReactions = Object.values(reactionsByType).reduce((sum, count) => sum + count, 0);
  const commentCount = post.comments_count || 0;
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

  // Manejador local para evitar duplicación de actualizaciones de UI
  const handleReaction = (type: ReactionType) => {
    onReaction(type);
  };

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

  return (
    <div className="space-y-2">
      {/* Interactions Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        {totalReactions > 0 && (
          <ReactionSummaryDialog reactions={reactionsByType} post={post} />
        )}
        
        {commentCount > 0 && (
          <CommentsCount 
            count={commentCount} 
            onClick={onCommentsClick} 
            isExpanded={commentsExpanded}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 border-t border-b py-1 post-actions">
        <LongPressReactionButton 
          userReaction={userReaction} 
          onReactionClick={handleReaction}
          postId={post.id}
        />

        <CommentButton 
          onToggleComments={onToggleComments} 
          isExpanded={commentsExpanded}
        />

        <ShareOptions post={post}>
          <Button variant="ghost" size="sm" className="flex-1 post-action-button">
            <Share className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </ShareOptions>

        {/* Botón de unirse a la idea, visible solo si hay una idea en el post y el usuario no se ha unido */}
        {showJoinButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 post-action-button text-primary" 
            onClick={() => setIsJoinDialogOpen(true)}
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Unirme
          </Button>
        )}
      </div>

      {/* Diálogo para unirse a la idea */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unirse a la idea: {post.idea?.title}</DialogTitle>
            <DialogDescription>
              Comparte tu profesión para que el creador de la idea sepa cómo puedes contribuir.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Tu profesión o habilidad"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleJoinIdea}>
              Unirme a la idea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
