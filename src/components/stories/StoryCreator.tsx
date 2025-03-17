
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStoryCreator } from "@/hooks/use-story-creator";
import { StoryFileSelector } from "./StoryFileSelector";
import { StoryEditor } from "./StoryEditor";
import { StoryVisibility } from "./utils/story-utils";

interface StoryCreatorProps {
  onClose: () => void;
  currentUserId: string;
}

export function StoryCreator({ onClose, currentUserId }: StoryCreatorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    previewUrls,
    isUploading,
    currentPreviewIndex,
    visibility,
    setVisibility,
    isEditing,
    setIsEditing,
    addFiles,
    removeImage,
    handleSubmit
  } = useStoryCreator(currentUserId, onClose);

  const handleAddMore = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePrivacyChange = (value: StoryVisibility) => {
    setVisibility(value);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md p-0 h-[90vh] max-h-[700px] overflow-hidden">
        {isEditing && previewUrls.length > 0 ? (
          <StoryEditor
            previewUrl={previewUrls[currentPreviewIndex]}
            visibility={visibility}
            onVisibilityChange={handlePrivacyChange}
            onClose={() => setIsEditing(false)}
            onSubmit={handleSubmit}
            isUploading={isUploading}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Crear historia</DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col gap-4">
              <StoryFileSelector
                previewUrls={previewUrls}
                onFilesSelected={addFiles}
                onAddMore={handleAddMore}
                onViewStory={() => setIsEditing(true)}
                onRemoveImage={removeImage}
              />
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                {previewUrls.length > 0 && (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isUploading}
                  >
                    {isUploading ? "Subiendo..." : "Publicar historia"}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
