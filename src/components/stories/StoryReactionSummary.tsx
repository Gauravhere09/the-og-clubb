
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { type ReactionType } from "@/types/database/social.types";
import { reactionIcons } from "../post/reactions/ReactionIcons";

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
    <div className="flex items-center gap-1 text-xs bg-black/80 dark:bg-black/80 text-white px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
      <div className="flex -space-x-1 mr-1">
        {Object.entries(reactionCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([type, count]) => {
            const ReactionIcon = reactionIcons[type as ReactionType]?.icon;
            return (
              <div key={type} className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white">
                {ReactionIcon && <ReactionIcon className="h-3 w-3" />}
              </div>
            );
          })}
      </div>
      {totalReactions > 0 && (
        <span className="text-white font-medium">{totalReactions} {totalReactions === 1 ? 'reacción' : 'reacciones'}</span>
      )}
    </div>
  );
}
