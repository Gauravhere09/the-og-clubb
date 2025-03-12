
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { type Reaction } from "./StoryReaction";
import { Heart, ThumbsUp, Star, PartyPopper } from "lucide-react";

interface StoryReactionSummaryProps {
  storyId: string;
}

export function StoryReactionSummary({ storyId }: StoryReactionSummaryProps) {
  const { data: reactions = [] } = useQuery({
    queryKey: ["story-reactions", storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_reactions')
        .select('reaction_type, user_id')
        .eq('story_id', storyId);
        
      if (error) {
        console.error("Error fetching reactions:", error);
        return [];
      }
      
      return data;
    }
  });
  
  if (reactions.length === 0) return null;
  
  // Count reactions by type
  const reactionCounts: Record<string, number> = {};
  reactions.forEach((reaction) => {
    const type = reaction.reaction_type;
    if (type) {
      reactionCounts[type] = (reactionCounts[type] || 0) + 1;
    }
  });
  
  // Get total reactions
  const totalReactions = reactions.length;

  const reactionIcons = {
    heart: <Heart className="h-3 w-3" />,
    like: <ThumbsUp className="h-3 w-3" />,
    star: <Star className="h-3 w-3" />,
    party: <PartyPopper className="h-3 w-3" />
  };
  
  return (
    <div className="flex items-center gap-1 text-xs bg-black/30 text-white px-2 py-1 rounded-full backdrop-blur-sm">
      <div className="flex -space-x-1 mr-1">
        {Object.entries(reactionCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([type, count]) => (
            <div key={type} className="flex items-center justify-center w-4 h-4 rounded-full bg-primary">
              {type in reactionIcons ? reactionIcons[type as keyof typeof reactionIcons] : null}
            </div>
          ))}
      </div>
      {totalReactions > 0 && (
        <span>{totalReactions} {totalReactions === 1 ? 'reacción' : 'reacciones'}</span>
      )}
    </div>
  );
}
