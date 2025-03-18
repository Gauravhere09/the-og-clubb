
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StoryFileSelector } from "./StoryFileSelector";
import { StoryEditor } from "./StoryEditor";
import { useStoryCreator } from "@/hooks/use-story-creator";
import { useRef } from "react";

interface StoryCreatorProps {
  onClose: () => void;
  currentUserId: string;
}

export function StoryCreator({ onClose, currentUserId }: StoryCreatorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    files,
    previewUrls,
    isUploading,
    currentPreviewIndex,
    setCurrentPreviewIndex,
    visibility,
    setVisibility,
    isEditing,
    setIsEditing,
    userProfile,
    addFiles,
    removeImage,
    handleSubmit
  } = useStoryCreator(currentUserId, onClose);

  const handleViewStory = () => {
    // Preview functionality - switches to editor mode
    setIsEditing(true);
  };

  const handleAddMore = () => {
    // Trigger file input click
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && !isUploading && onClose()}>
      <DialogContent className="max-w-[90vw] h-[90vh] md:max-w-xl md:h-[80vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Crear historia</DialogTitle>
          <DialogDescription>
            Sube fotos o videos para compartir con tus amigos
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-full flex flex-col">
          {isEditing ? (
            <StoryEditor
              previewUrls={previewUrls}
              currentIndex={currentPreviewIndex}
              onIndexChange={setCurrentPreviewIndex}
              onRemoveImage={removeImage}
              visibility={visibility}
              onVisibilityChange={setVisibility}
              onSubmit={handleSubmit}
              isUploading={isUploading}
              userProfile={userProfile}
            />
          ) : (
            <StoryFileSelector 
              previewUrls={previewUrls}
              onFilesSelected={addFiles}
              onAddMore={handleAddMore}
              onViewStory={handleViewStory}
              onRemoveImage={removeImage}
              fileInputRef={fileInputRef}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
