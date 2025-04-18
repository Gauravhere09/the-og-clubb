
import { Button } from "@/components/ui/button";
import { useAttachment, AttachmentType, UseAttachmentOptions } from "@/hooks/use-attachment";
import { useEffect, RefObject } from "react";
import { ImageIcon, FileIcon, MusicIcon, XIcon } from "lucide-react";

interface AttachmentInputProps extends UseAttachmentOptions {
  onAttachmentChange?: (files: File[] | null) => void;
  buttonVariant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonClassName?: string;
  showLabel?: boolean;
  label?: string;
  disabled?: boolean;
  fileInputRef?: RefObject<HTMLInputElement>;
  className?: string; // Add this line to accept className prop
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
  label,
  disabled = false,
  fileInputRef: externalFileInputRef,
  className = "" // Add the className prop with a default empty string
}: AttachmentInputProps) {
  const {
    fileInputRef: internalFileInputRef,
    handleAttachmentChange,
    cleanup
  } = useAttachment({
    type,
    multiple,
    validation,
    onAttachmentChange
  });
  
  // Use external ref if provided, otherwise use the internal one
  const fileInputRef = externalFileInputRef || internalFileInputRef;
  
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
        className={`flex items-center gap-1 ${buttonClassName} ${className}`}
        disabled={disabled}
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
