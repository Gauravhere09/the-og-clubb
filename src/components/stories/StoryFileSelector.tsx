
import { Button } from "@/components/ui/button";
import { X, Plus, Eye, Upload, Image, Video } from "lucide-react";
import { RefObject } from "react";

interface StoryFileSelectorProps {
  previewUrls: string[];
  onFilesSelected: (files: File[]) => void;
  onAddMore: () => void;
  onViewStory: () => void;
  onRemoveImage: (index: number) => void;
  fileInputRef?: RefObject<HTMLInputElement>;
}

export function StoryFileSelector({
  previewUrls,
  onFilesSelected,
  onAddMore,
  onViewStory,
  onRemoveImage,
  fileInputRef
}: StoryFileSelectorProps) {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {previewUrls.length === 0 ? (
        <div 
          className="border-2 border-dashed border-primary/30 hover:border-primary/60 dark:border-primary/20 dark:hover:border-primary/40 rounded-lg p-8 text-center hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer"
          onClick={() => fileInputRef?.current?.click()}
        >
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            multiple
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Sube tu historia</h3>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="mb-2 flex items-center gap-2"
              >
                <Image className="h-4 w-4" />
                Seleccionar imágenes
              </Button>
              
              <Button 
                variant="default"
                className="mb-2 flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                O videos
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Formatos soportados: JPG, PNG, GIF, MP4, WEBM
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap gap-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img 
                  src={url} 
                  alt={`Preview ${index + 1}`} 
                  className="h-24 w-24 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              onClick={onAddMore}
              className="h-24 w-24 flex items-center justify-center border border-dashed border-primary/40 hover:border-primary rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
            >
              <Plus className="h-6 w-6 text-primary" />
            </button>
          </div>
          
          <div className="mt-4">
            <Button onClick={onViewStory} variant="outline" className="w-full flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Previsualizar historia
            </Button>
            
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              multiple
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}
