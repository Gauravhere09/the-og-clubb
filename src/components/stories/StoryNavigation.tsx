
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StoryNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function StoryNavigation({ onPrevious, onNext, isFirst, isLast }: StoryNavigationProps) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
        onClick={onPrevious}
        disabled={isFirst}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
        onClick={onNext}
        disabled={isLast}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
    </>
  );
}
