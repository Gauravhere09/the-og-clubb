
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
          // Create a more complete synthetic event that better matches React.ChangeEvent<HTMLInputElement>
          const syntheticEvent = {
            target: {
              files: {
                0: files[0],
                length: 1,
                item: (index: number) => files[index]
              }
            },
            // Add minimal required properties to pass type checking
            currentTarget: {
              files: {
                0: files[0],
                length: 1,
                item: (index: number) => files[index]
              }
            },
            preventDefault: () => {},
            stopPropagation: () => {},
            nativeEvent: new Event('change'),
            bubbles: true,
            cancelable: true,
            defaultPrevented: false,
            isDefaultPrevented: () => false,
            isPropagationStopped: () => false,
            persist: () => {},
            timeStamp: Date.now(),
            type: 'change',
            isTrusted: true
          } as React.ChangeEvent<HTMLInputElement>;
          
          onImageChange(syntheticEvent);
        }
      }}
      showLabel={true}
      buttonSize="sm"
    />
  );
}
