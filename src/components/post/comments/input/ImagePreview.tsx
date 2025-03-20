
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImagePreviewProps {
  imagePreview: string | null;
  onRemoveImage: () => void;
}

export function ImagePreview({ imagePreview, onRemoveImage }: ImagePreviewProps) {
  if (!imagePreview) return null;
  
  return (
    <div className="relative">
      <img 
        src={imagePreview} 
        alt="Vista previa" 
        className="max-h-60 rounded-md object-contain"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 rounded-full"
        onClick={onRemoveImage}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
