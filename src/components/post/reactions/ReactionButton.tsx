
import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { reactionIcons, type ReactionType } from "./ReactionIcons";
import { useToast } from "@/hooks/use-toast";
import { useLongPressReaction } from "./hooks/use-long-press-reaction";

interface ReactionButtonProps {
  userReaction?: ReactionType;
  onReactionClick: (type: ReactionType) => void;
  postId: string;
}

export function ReactionButton({ userReaction, onReactionClick, postId }: ReactionButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Use our custom hook for reaction logic
  const {
    isSubmitting,
    handleReactionClick,
    authError,
    isAuthenticated
  } = useLongPressReaction({
    userReaction,
    onReactionClick,
    postId
  });

  const handleOpenChange = async (open: boolean) => {
    if (open) {
      if (isAuthenticated) {
        setIsOpen(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: authError || "Debes iniciar sesión para reaccionar",
        });
      }
    } else {
      setIsOpen(false);
    }
  };

  // Handle direct button click (for the current reaction)
  const handleButtonClick = async () => {
    if (userReaction) {
      if (isAuthenticated) {
        handleReactionClick(userReaction);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: authError || "Debes iniciar sesión para reaccionar",
        });
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`${userReaction ? reactionIcons[userReaction].color : ''} group`}
          onClick={handleButtonClick}
          disabled={isSubmitting}
        >
          {userReaction ? (
            <div className="flex items-center">
              <span className={`inline-block ${reactionIcons[userReaction].color}`}>
                {React.createElement(reactionIcons[userReaction].icon, { className: "h-4 w-4" })}
              </span>
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
              <span className={`inline-block ${color}`}>
                <Icon className="h-6 w-6" />
              </span>
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
