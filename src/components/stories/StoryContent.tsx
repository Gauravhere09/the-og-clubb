
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";

interface StoryMedia {
  url: string;
  type: 'image' | 'video';
}

interface StoryContentProps {
  mediaItems: StoryMedia[];
  currentIndex: number;
  onContentClick: () => void;
  onNextImage: () => void;
  onPrevImage: () => void;
  isPaused: boolean;
  className?: string;
}

export function StoryContent({ 
  mediaItems, 
  currentIndex, 
  onContentClick, 
  onNextImage, 
  onPrevImage,
  isPaused,
  className
}: StoryContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const currentItem = mediaItems[currentIndex];
  const isVideo = currentItem?.type === 'video';
  
  // Handle pause/play for videos
  useEffect(() => {
    if (videoRef.current && isVideo) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      }
    }
  }, [isPaused, isVideo, currentIndex]);
  
  return (
    <div 
      className={cn("flex-1 bg-black flex items-center justify-center relative", className)}
      onClick={onContentClick}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          src={currentItem.url}
          className="max-h-full max-w-full object-contain animate-fade-in"
          autoPlay
          playsInline
          controls
          loop
          key={currentItem.url} // Key for resetting the video when changed
        />
      ) : (
        <img 
          src={currentItem.url}
          alt={`Story ${currentIndex + 1}`} 
          className="max-h-full max-w-full object-contain animate-fade-in"
          key={currentItem.url} // Key for animation on image change
        />
      )}
      
      {mediaItems.length > 1 && (
        <>
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/20 text-white hover:bg-background/40"
              onClick={(e) => {
                e.stopPropagation();
                onPrevImage();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          
          {currentIndex < mediaItems.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/20 text-white hover:bg-background/40"
              onClick={(e) => {
                e.stopPropagation();
                onNextImage();
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
        </>
      )}
      
      {mediaItems.length > 1 && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1">
          {mediaItems.map((_, index) => (
            <div 
              key={index} 
              className={`h-1 rounded-full ${
                index === currentIndex 
                  ? "bg-primary w-6" 
                  : "bg-background/30 w-4"
              } transition-all duration-300`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
