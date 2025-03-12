
import { Heart, ThumbsUp, Smile, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StoryReactionProps {
  storyId: string;
  userId: string;
  showReactions: boolean;
  className?: string;
}

export type StoryReactionType = "like" | "love" | "haha" | "wow";

interface Reaction {
  type: StoryReactionType;
  icon: React.ReactNode;
  color: string;
  label: string;
}

const reactionTypes: Record<StoryReactionType, Reaction> = {
  like: {
    type: "like",
    icon: <ThumbsUp className="h-4 w-4" />,
    color: "text-blue-500",
    label: "Me gusta"
  },
  love: {
    type: "love",
    icon: <Heart className="h-4 w-4" />,
    color: "text-red-500",
    label: "Me encanta"
  },
  haha: {
    type: "haha",
    icon: <Smile className="h-4 w-4" />,
    color: "text-yellow-500",
    label: "Me divierte"
  },
  wow: {
    type: "wow",
    icon: <Star className="h-4 w-4" />,
    color: "text-purple-500",
    label: "Me asombra"
  }
};

export function StoryReaction({ storyId, userId, showReactions, className }: StoryReactionProps) {
  const { toast } = useToast();
  const [currentReaction, setCurrentReaction] = useState<StoryReactionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReaction = async (reactionType: StoryReactionType) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (currentReaction === reactionType) {
        // Si es la misma reacción, la eliminamos
        const { error } = await supabase
          .from('story_reactions')
          .delete()
          .eq('story_id', storyId)
          .eq('user_id', userId);
          
        if (error) throw error;
        
        setCurrentReaction(null);
        toast({
          title: "Reacción eliminada",
          description: "Has quitado tu reacción de esta historia",
        });
      } else {
        // Si ya tiene una reacción, la actualizamos
        if (currentReaction) {
          const { error } = await supabase
            .from('story_reactions')
            .update({ reaction_type: reactionType })
            .eq('story_id', storyId)
            .eq('user_id', userId);
            
          if (error) throw error;
        } else {
          // Si no tiene reacción, insertamos una nueva
          const { error } = await supabase
            .from('story_reactions')
            .insert({
              story_id: storyId,
              user_id: userId,
              reaction_type: reactionType
            });
            
          if (error) throw error;
        }
        
        setCurrentReaction(reactionType);
        toast({
          title: "Reacción enviada",
          description: `Has reaccionado con "${reactionTypes[reactionType].label}" a esta historia`,
        });
      }
    } catch (error) {
      console.error('Error al gestionar la reacción:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar tu reacción",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!showReactions) {
    return null;
  }
  
  return (
    <div className={cn("flex justify-center gap-2 py-2", className)}>
      {Object.entries(reactionTypes).map(([type, reaction]) => (
        <Button
          key={type}
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-full hover:bg-accent/50",
            currentReaction === type && reaction.color
          )}
          onClick={() => handleReaction(type as StoryReactionType)}
          disabled={isSubmitting}
        >
          <span className={cn(
            "flex items-center gap-1",
            currentReaction === type && reaction.color
          )}>
            {reaction.icon}
          </span>
        </Button>
      ))}
    </div>
  );
}
