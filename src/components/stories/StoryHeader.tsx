
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StoryHeaderProps {
  username: string;
  avatarUrl: string | null;
  timeDisplay: string;
  progress: number;
  currentImageIndex: number;
  totalImages: number;
  onClose: () => void;
}

export function StoryHeader({ 
  username, 
  avatarUrl, 
  timeDisplay, 
  progress, 
  currentImageIndex,
  totalImages,
  onClose 
}: StoryHeaderProps) {
  return (
    <div className="p-4 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-background/80 to-transparent">
      <div className="flex gap-1 w-full mb-3">
        {Array.from({ length: totalImages }).map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-background/30 rounded-full overflow-hidden">
            {index < currentImageIndex ? (
              <div className="bg-primary h-1 w-full" />
            ) : index === currentImageIndex ? (
              <div 
                className="bg-primary h-1 transition-all duration-100 ease-linear" 
                style={{ width: `${progress}%` }}
              />
            ) : null}
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>{username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {username}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeDisplay} • {currentImageIndex + 1}/{totalImages}
            </span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-foreground"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
