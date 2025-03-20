
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface ImageButtonProps {
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function ImageButton({ onImageChange, fileInputRef }: ImageButtonProps) {
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleImageClick}
        className="text-xs flex items-center gap-1"
      >
        <ImageIcon className="h-3 w-3" />
        Imagen
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onImageChange}
        accept="image/*"
        className="hidden"
      />
    </>
  );
}
