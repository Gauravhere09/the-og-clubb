
import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { reactionIcons, type ReactionType } from "./ReactionIcons";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ReactionButtonProps {
  userReaction?: ReactionType;
  onReactionClick: (type: ReactionType) => void;
  postId: string;
}

export function ReactionButton({ userReaction, onReactionClick, postId }: ReactionButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleReactionClick = async (type: ReactionType) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para reaccionar");

      // We'll handle the UI update AFTER the database operation is complete
      // to prevent double counting

      if (userReaction === type) {
        // If the user clicks on their current reaction, remove it
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        // Only update UI after successful database operation
        onReactionClick(type);
      } else {
        // First delete any existing reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        // Then insert the new reaction
        const { error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: type
          });

        if (error) throw error;
        
        // Only update UI after successful database operation
        onReactionClick(type);
      }
      
      // Invalidate the posts and reactions queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      await queryClient.invalidateQueries({ queryKey: ["post-reactions", postId] });
      
    } catch (error) {
      console.error('Error al gestionar la reacción:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar tu reacción",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`${userReaction ? reactionIcons[userReaction].color : ''} group`}
          onClick={() => userReaction && handleReactionClick(userReaction)}
          disabled={isSubmitting}
        >
          {userReaction ? (
            <div className="flex items-center">
              {React.createElement(reactionIcons[userReaction].icon, { className: "h-4 w-4" })}
              <span className="ml-2">{reactionIcons[userReaction].label}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Me gusta
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-fit p-2" 
        side="top"
        align="start"
        sideOffset={5}
      >
        <div className="flex gap-1">
          {Object.entries(reactionIcons).map(([type, { icon: Icon, color, label }]) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className={`hover:${color} ${userReaction === type ? color : ''} relative group hover:scale-125 transition-transform duration-200`}
              onClick={() => handleReactionClick(type as ReactionType)}
              disabled={isSubmitting}
            >
              <Icon className="h-6 w-6" />
              <span className="absolute -top-8 scale-0 transition-all rounded bg-black px-2 py-1 text-xs text-white group-hover:scale-100 whitespace-nowrap">
                {label}
              </span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
