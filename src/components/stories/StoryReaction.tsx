
import { useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { type ReactionType } from '@/types/database/social.types';
import { reactionIcons } from '../post/reactions/ReactionIcons';

interface StoryReactionProps {
  storyId: string;
  userId: string;
  showReactions: boolean;
  className?: string;
}

export function StoryReaction({ storyId, userId, showReactions, className }: StoryReactionProps) {
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);
  const { toast } = useToast();

  // Define the order of reactions to match the image
  const orderedReactionTypes: ReactionType[] = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

  const handleReaction = async (reaction: ReactionType) => {
    try {
      const { data: existingReaction } = await supabase
        .from('story_reactions')
        .select()
        .eq('user_id', userId)
        .eq('story_id', storyId)
        .single();

      if (existingReaction) {
        await supabase
          .from('story_reactions')
          .update({ reaction_type: reaction })
          .eq('user_id', userId)
          .eq('story_id', storyId);
      } else {
        await supabase
          .from('story_reactions')
          .insert([{ 
            user_id: userId, 
            story_id: storyId, 
            reaction_type: reaction 
          }]);
      }

      setSelectedReaction(reaction);
      toast({
        title: "Reacción enviada",
        description: "Tu reacción ha sido guardada",
      });
    } catch (error) {
      console.error('Error al enviar reacción:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar tu reacción",
      });
    }
  };

  if (!showReactions) return null;

  return (
    <div className={`${className} bg-black/80 dark:bg-background/40 backdrop-blur-sm rounded-full p-2 shadow-md border border-gray-700 dark:border-border`}>
      <div className="flex justify-center space-x-2">
        {orderedReactionTypes.map((type) => {
          const { icon: Icon, color, label } = reactionIcons[type];
          return (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className={`hover:bg-primary/10 rounded-full text-white ${selectedReaction === type ? color : ''}`}
              onClick={() => handleReaction(type)}
              title={label}
            >
              <Icon className="h-5 w-5" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
