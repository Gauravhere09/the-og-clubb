
import { Button } from "@/components/ui/button";
import { useAttachment, AttachmentType, UseAttachmentOptions } from "@/hooks/use-attachment";
import { useEffect } from "react";
import { ImageIcon, FileIcon, MusicIcon, XIcon } from "lucide-react";

interface AttachmentInputProps extends UseAttachmentOptions {
  onAttachmentChange?: (files: File[] | null) => void;
  buttonVariant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonClassName?: string;
  showLabel?: boolean;
  label?: string;
}

export function AttachmentInput({
  type = 'image',
  multiple = false,
  validation = {},
  onAttachmentChange,
  buttonVariant = "ghost",
  buttonSize = "sm",
  buttonClassName = "",
  showLabel = true,
  label
}: AttachmentInputProps) {
  const {
    fileInputRef,
    handleAttachmentChange,
    cleanup
  } = useAttachment({
    type,
    multiple,
    validation,
    onAttachmentChange
  });
  
  // Clean up on unmount
  useEffect(() => {
    return () => cleanup();
  }, []);
  
  const getIcon = () => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'audio':
        return <MusicIcon className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };
  
  const getLabel = () => {
    if (label) return label;
    
    switch (type) {
      case 'image':
        return 'Imagen';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      default:
        return 'Archivo';
    }
  };
  
  const getAccept = () => {
    switch (type) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'audio':
        return 'audio/*';
      default:
        return undefined;
    }
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <>
      <Button 
        variant={buttonVariant} 
        size={buttonSize} 
        onClick={handleClick}
        className={`flex items-center gap-1 ${buttonClassName}`}
      >
        {getIcon()}
        {showLabel && <span>{getLabel()}</span>}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAttachmentChange}
        accept={getAccept()}
        multiple={multiple}
        className="hidden"
      />
    </>
  );
}
