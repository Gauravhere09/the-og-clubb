
import { Button } from "@/components/ui/button";

interface FilePreviewProps {
  file: File | null;
  onRemove: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  if (!file) return null;

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
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-2 right-2"
        onClick={onRemove}
      >
        Eliminar
      </Button>
    </div>
  );
}
