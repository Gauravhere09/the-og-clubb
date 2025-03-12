
import { useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, ThumbsUp, Star, PartyPopper } from 'lucide-react';

interface StoryReactionProps {
  storyId: string;
  userId: string;
  showReactions: boolean;
  className?: string;
}

export type Reaction = 'heart' | 'like' | 'star' | 'party';

export function StoryReaction({ storyId, userId, showReactions, className }: StoryReactionProps) {
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null);
  const { toast } = useToast();

  const reactionIcons = {
    heart: <Heart className="h-6 w-6" />,
    like: <ThumbsUp className="h-6 w-6" />,
    star: <Star className="h-6 w-6" />,
    party: <PartyPopper className="h-6 w-6" />
  };

  const handleReaction = async (reaction: Reaction) => {
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
    <div className={className}>
      <div className="flex justify-center space-x-4">
        {(Object.entries(reactionIcons) as [Reaction, JSX.Element][]).map(([type, icon]) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className={`hover:bg-primary/20 ${selectedReaction === type ? 'text-primary' : ''}`}
            onClick={() => handleReaction(type)}
          >
            {icon}
          </Button>
        ))}
      </div>
    </div>
  );
}
