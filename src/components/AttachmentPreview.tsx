
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AttachmentPreviewProps {
  previews: string[];
  files: File[];
  onRemove: (index: number) => void;
  className?: string;
  previewClassName?: string;
  removeButtonClassName?: string;
}

export function AttachmentPreview({ 
  previews, 
  files, 
  onRemove,
  className = "",
  previewClassName = "",
  removeButtonClassName = ""
}: AttachmentPreviewProps) {
  if (previews.length === 0) return null;
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {previews.map((preview, index) => {
        const file = files[index];
        
        // If there's no preview URL but we have a file, create a generic file preview
        if (!preview && file) {
          return (
            <div 
              key={index} 
              className={`relative flex items-center justify-center bg-muted rounded-md p-4 h-24 w-24 ${previewClassName}`}
            >
              <span className="text-xs text-center break-all max-w-full">
                {file.name.length > 20 ? `${file.name.substring(0, 17)}...` : file.name}
              </span>
              <Button
                variant="destructive"
                size="icon"
                className={`absolute top-1 right-1 h-5 w-5 rounded-full ${removeButtonClassName}`}
                onClick={() => onRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        }
        
        // If it's an image file with a preview URL
        if (preview && file.type.startsWith('image/')) {
          return (
            <div key={index} className="relative">
              <img 
                src={preview} 
                alt={`Preview ${index + 1}`} 
                className={`h-24 w-24 object-cover rounded-md ${previewClassName}`}
              />
              <Button
                variant="destructive"
                size="icon"
                className={`absolute top-1 right-1 h-5 w-5 rounded-full ${removeButtonClassName}`}
                onClick={() => onRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        }
        
        // For video files
        if (file.type.startsWith('video/')) {
          return (
            <div key={index} className="relative">
              <video 
                src={URL.createObjectURL(file)} 
                className={`h-24 w-24 object-cover rounded-md ${previewClassName}`}
                controls
              />
              <Button
                variant="destructive"
                size="icon"
                className={`absolute top-1 right-1 h-5 w-5 rounded-full ${removeButtonClassName}`}
                onClick={() => onRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        }
        
        // For audio files
        if (file.type.startsWith('audio/')) {
          return (
            <div key={index} className="relative">
              <audio 
                src={URL.createObjectURL(file)} 
                className={`h-12 w-24 ${previewClassName}`}
                controls
              />
              <Button
                variant="destructive"
                size="icon"
                className={`absolute top-1 right-1 h-5 w-5 rounded-full ${removeButtonClassName}`}
                onClick={() => onRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
}
