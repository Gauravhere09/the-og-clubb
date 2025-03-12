
import { useState, useEffect } from "react";

interface StoryProgressProps {
  isPaused: boolean;
  currentImageIndex: number;
  totalImages: number;
  onComplete: () => void;
  onImageComplete: () => void;
}

export function StoryProgress({ 
  isPaused, 
  currentImageIndex, 
  totalImages, 
  onComplete,
  onImageComplete 
}: StoryProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
  }, [currentImageIndex]);

  useEffect(() => {
    if (isPaused) return;

    const duration = 5000;
    const interval = 100;
    const increment = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          
          if (currentImageIndex < totalImages - 1) {
            onImageComplete();
            return 0;
          } else {
            setTimeout(() => {
              onComplete();
            }, 300);
            return 100;
          }
        }
        return newProgress;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [isPaused, onComplete, onImageComplete, currentImageIndex, totalImages]);

  return { progress };
}
