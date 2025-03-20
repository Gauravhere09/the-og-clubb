
import { Button } from "@/components/ui/button";

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
    return (
      <div className="relative">
        {file.type.startsWith('image/') && (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
        )}
        {file.type.startsWith('video/') && (
          <video
            src={URL.createObjectURL(file)}
            controls
            className="w-full rounded-lg"
          />
        )}
        {file.type.startsWith('audio/') && (
          <audio
            src={URL.createObjectURL(file)}
            controls
            className="w-full"
          />
        )}
        {onRemove && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onRemove}
          >
            Eliminar
          </Button>
        )}
      </div>
    );
  }

  // If url/type is provided (for PostContent)
  if (url && type) {
    return (
      <div className="relative">
        {type.startsWith('image') && (
          <img
            src={url}
            alt="Media"
            className="w-full max-h-96 object-contain rounded-lg cursor-pointer"
            onClick={() => setIsModalOpen && setIsModalOpen(true)}
          />
        )}
        {type.startsWith('video') && (
          <video
            src={url}
            controls
            className="w-full rounded-lg"
          />
        )}
        {type.startsWith('audio') && (
          <audio
            src={url}
            controls
            className="w-full"
          />
        )}
      </div>
    );
  }
  
  return null;
}
