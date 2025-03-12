
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoryReactionType } from "./StoryReaction";
import { Heart, ThumbsUp, Smile, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StoryReactionSummaryProps {
  storyId: string;
  className?: string;
}

const reactionIcons: Record<StoryReactionType, {icon: React.ReactNode, color: string}> = {
  like: { icon: <ThumbsUp className="h-3 w-3" />, color: "text-blue-500" },
  love: { icon: <Heart className="h-3 w-3" />, color: "text-red-500" },
  haha: { icon: <Smile className="h-3 w-3" />, color: "text-yellow-500" },
  wow: { icon: <Star className="h-3 w-3" />, color: "text-purple-500" }
};

export function StoryReactionSummary({ storyId, className }: StoryReactionSummaryProps) {
  const { data: reactionCounts = {}, isLoading } = useQuery({
    queryKey: ["story-reactions-count", storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_reactions')
        .select('reaction_type, count')
        .eq('story_id', storyId)
        .group_by('reaction_type');

      if (error) {
        console.error("Error fetching reaction counts:", error);
        return {};
      }

      const counts: Record<string, number> = {};
      data.forEach(item => {
        counts[item.reaction_type] = parseInt(item.count);
      });
      
      return counts;
    }
  });

  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  
  if (isLoading || totalReactions === 0) {
    return null;
  }
  
  // Obtener los tres tipos de reacciones más populares
  const topReactions = Object.entries(reactionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type as StoryReactionType);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1", className)}>
            <div className="flex -space-x-1">
              {topReactions.map(type => (
                <div 
                  key={type}
                  className={cn("w-5 h-5 rounded-full flex items-center justify-center bg-background border border-background", reactionIcons[type].color)}
                >
                  {reactionIcons[type].icon}
                </div>
              ))}
            </div>
            <span className="text-xs ml-1">{totalReactions}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {Object.entries(reactionCounts).map(([type, count]) => (
              <div key={type} className="flex items-center gap-1">
                <div className={reactionIcons[type as StoryReactionType].color}>
                  {reactionIcons[type as StoryReactionType].icon}
                </div>
                <span className="text-xs">{count}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
