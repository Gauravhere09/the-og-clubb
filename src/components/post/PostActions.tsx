
import React from "react";
import { Button } from "@/components/ui/button";
import type { Post } from "@/types/post";
import { type ReactionType } from "./reactions/ReactionIcons";
import { ShareOptions } from "./actions/ShareOptions";
import { ReactionSummaryDialog } from "./actions/ReactionSummaryDialog";
import { CommentsCount } from "./actions/CommentsCount";
import { CommentButton } from "./actions/CommentButton";
import { LongPressReactionButton } from "./reactions/LongPressReactionButton";
import { Share, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TransformedIdea } from "@/lib/api/posts/types";
import { Json } from "@/integrations/supabase/types";

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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Manejador local para evitar duplicación de actualizaciones de UI
  const handleReaction = (type: ReactionType) => {
    onReaction(type);
  };

  const isIdeaPost = post.post_type === 'idea';
  const isParticipant = post.idea?.is_participant || false;

  const { mutate: joinIdea, isPending: isJoining } = useMutation({
    mutationFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Get user profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url, career')
        .eq('id', user.id)
        .single();

      if (!profileData) throw new Error("No se pudo obtener el perfil del usuario");

      // Get current post data
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('idea')
        .eq('id', post.id)
        .single();

      if (postError || !postData) throw new Error("No se pudo obtener la publicación");

      // Parse and validate the idea data
      const ideaData = postData.idea as unknown as TransformedIdea | null;
      
      if (!ideaData || !post.idea) {
        throw new Error("No se encontró la información de la idea");
      }

      const currentIdea = ideaData;

      // Check if user is already a participant
      const alreadyParticipant = currentIdea.participants?.some(
        (p) => p.user_id === user.id
      );

      if (alreadyParticipant) {
        return { alreadyParticipant: true };
      }

      // Add user to participants
      const newParticipant = {
        user_id: user.id,
        username: profileData.username || "",
        avatar_url: profileData.avatar_url,
        career: profileData.career,
        joined_at: new Date().toISOString()
      };

      const updatedIdea: TransformedIdea = {
        ...currentIdea,
        participants: [...(currentIdea.participants || []), newParticipant],
        participants_count: (currentIdea.participants_count || 0) + 1,
      };

      // Update post with new idea data
      const { error: updateError } = await supabase
        .from('posts')
        .update({ idea: updatedIdea as unknown as Json })
        .eq('id', post.id);

      if (updateError) throw updateError;

      return { 
        success: true, 
        updatedIdea,
        alreadyParticipant: false 
      };
    },
    onSuccess: (data) => {
      if (data.alreadyParticipant) {
        toast({
          title: "Ya te has unido",
          description: "Ya formas parte de esta idea",
        });
      } else {
        toast({
          title: "¡Te has unido!",
          description: "Ahora formas parte de esta idea",
        });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al unirte a la idea",
      });
    },
  });

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

        {isIdeaPost && post.idea && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{post.idea.participants_count || 0} profesionales</span>
          </div>
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

        {isIdeaPost && post.idea && !isParticipant && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 post-action-button"
            onClick={(e) => {
              e.stopPropagation();
              joinIdea();
            }}
            disabled={isJoining}
          >
            <Users className="h-4 w-4 mr-2" />
            Unirse a la idea
          </Button>
        )}

        <ShareOptions post={post}>
          <Button variant="ghost" size="sm" className="flex-1 post-action-button">
            <Share className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </ShareOptions>
      </div>
    </div>
  );
}
