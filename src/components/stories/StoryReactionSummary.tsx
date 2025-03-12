
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { type Reaction } from "./StoryReaction";

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
  
  return (
    <div className="flex items-center gap-1 text-xs bg-black/30 text-white px-2 py-1 rounded-full backdrop-blur-sm">
      {totalReactions > 0 && (
        <span>{totalReactions} {totalReactions === 1 ? 'reacción' : 'reacciones'}</span>
      )}
    </div>
  );
}
