
import { AttachmentInput } from "@/components/AttachmentInput";

interface ImageButtonProps {
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function ImageButton({ onImageChange, fileInputRef }: ImageButtonProps) {
  return (
    <AttachmentInput
      type="image"
      fileInputRef={fileInputRef}
      onAttachmentChange={(files) => {
        if (files && files.length > 0 && onImageChange) {
          // Create a synthetic event to match the expected format
          const syntheticEvent = {
            target: {
              files: {
                0: files[0],
                length: 1,
                item: (index: number) => files[index]
              }
            }
          } as React.ChangeEvent<HTMLInputElement>;
          
          onImageChange(syntheticEvent);
        }
      }}
      showLabel={true}
      buttonSize="sm"
    />
  );
}
