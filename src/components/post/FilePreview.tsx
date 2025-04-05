
import { AttachmentPreview } from "@/components/AttachmentPreview";

interface FilePreviewProps {
  file?: File | null;
  onRemove?: () => void;
  // Add new props for PostContent component
  url?: string;
  type?: string;
  isModalOpen?: boolean;
  setIsModalOpen?: (value: boolean) => void;
}

export function FilePreview({ file, onRemove, url, type, isModalOpen, setIsModalOpen }: FilePreviewProps) {
  // If file is provided (for PostCreator)
  if (file) {
    // Create a preview URL from the file
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
    
    return (
      <AttachmentPreview
        previews={[preview]}
        files={[file]}
        onRemove={() => onRemove && onRemove()}
        className="w-full"
        previewClassName="w-full h-48 object-cover"
      />
    );
  }

  // If url/type is provided (for PostContent)
  if (url && type) {
    // For non-image types, we need to handle differently
    if (type.startsWith('image')) {
      return (
        <div className="relative flex justify-center">
          <img
            src={url}
            alt="Media"
            className="max-w-full max-h-[500px] object-contain rounded-lg cursor-pointer"
            onClick={() => setIsModalOpen && setIsModalOpen(true)}
          />
        </div>
      );
    } else if (type.startsWith('video')) {
      return (
        <div className="relative flex justify-center">
          <video
            src={url}
            controls
            className="max-w-full rounded-lg"
          />
        </div>
      );
    } else if (type.startsWith('audio')) {
      return (
        <div className="relative">
          <audio
            src={url}
            controls
            className="w-full"
          />
        </div>
      );
    }
  }
  
  return null;
}
