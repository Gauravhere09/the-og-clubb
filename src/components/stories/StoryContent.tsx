
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StoryContentProps {
  imageUrls: string[];
  currentImageIndex: number;
  onContentClick: () => void;
  onNextImage: () => void;
  onPrevImage: () => void;
  className?: string;
}

export function StoryContent({ 
  imageUrls, 
  currentImageIndex, 
  onContentClick, 
  onNextImage, 
  onPrevImage,
  className
}: StoryContentProps) {
  return (
    <div 
      className={cn("flex-1 bg-black flex items-center justify-center relative", className)}
      onClick={onContentClick}
    >
      <img 
        src={imageUrls[currentImageIndex]} 
        alt={`Story ${currentImageIndex + 1}`} 
        className="max-h-full max-w-full object-contain animate-fade-in" 
        key={imageUrls[currentImageIndex]} // Key for animation on image change
      />
      
      {imageUrls.length > 1 && (
        <>
          {currentImageIndex > 0 && (
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
          
          {currentImageIndex < imageUrls.length - 1 && (
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
      
      {imageUrls.length > 1 && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1">
          {imageUrls.map((_, index) => (
            <div 
              key={index} 
              className={`h-1 rounded-full ${
                index === currentImageIndex 
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
