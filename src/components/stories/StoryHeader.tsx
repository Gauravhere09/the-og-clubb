
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Story } from "./types";

interface StoryHeaderProps {
  story: Story;
  onClose: () => void;
}

export function StoryHeader({ story, onClose }: StoryHeaderProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Avatar className="w-10 h-10 border-2 border-white">
          <AvatarImage src={story.user.avatar_url || undefined} />
          <AvatarFallback>{story.user.username[0]}</AvatarFallback>
        </Avatar>
        <div className="text-white">
          <p className="font-semibold">{story.user.username}</p>
          <p className="text-xs opacity-75">
            {new Date(story.created_at).toLocaleString()}
          </p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        className="text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>
    </div>
  );
}
