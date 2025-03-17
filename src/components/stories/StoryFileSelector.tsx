
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image, Plus, X } from "lucide-react";
import { validateStoryFile } from "./utils/story-utils";

interface StoryFileSelectorProps {
  previewUrls: string[];
  onFilesSelected: (files: File[]) => void;
  onAddMore: () => void;
  onViewStory: () => void;
  onRemoveImage: (index: number) => void;
}

export function StoryFileSelector({
  previewUrls,
  onFilesSelected,
  onAddMore,
  onViewStory,
  onRemoveImage
}: StoryFileSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const newFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    Array.from(e.target.files).forEach(file => {
      if (validateStoryFile(file)) {
        newFiles.push(file);
      }
    });

    if (newFiles.length > 0) {
      onFilesSelected(newFiles);
    }
  };

  if (previewUrls.length > 0) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img 
                src={url} 
                alt={`Preview ${index + 1}`} 
                className="w-full h-32 object-cover rounded-md cursor-pointer" 
                onClick={() => onViewStory()}
              />
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => onRemoveImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onAddMore}
        >
          <Plus className="mr-2 h-4 w-4" />
          Añadir más imágenes
        </Button>

        <Button 
          variant="default"
          className="w-full"
          onClick={onViewStory}
        >
          Ver historia
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-60 bg-muted rounded-md border-2 border-dashed border-muted-foreground/25">
      <div className="flex flex-col items-center justify-center space-y-2">
        <Image className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Arrastra imágenes o haz clic para subirlas
        </p>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="mr-2 h-4 w-4" />
          Seleccionar imágenes
        </Button>
      </div>
      <input
        ref={fileInputRef}
        id="story-file"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
