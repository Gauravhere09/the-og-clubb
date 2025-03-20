
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export type AttachmentType = 'image' | 'video' | 'audio' | 'any';
export type AttachmentValidation = {
  maxSize?: number; // in bytes
  types?: string[]; // e.g. ['image/jpeg', 'image/png']
};

// Default validations
const DEFAULT_VALIDATIONS: Record<AttachmentType, AttachmentValidation> = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  video: {
    maxSize: 50 * 1024 * 1024, // 50MB
    types: ['video/mp4', 'video/webm']
  },
  audio: {
    maxSize: 10 * 1024 * 1024, // 10MB
    types: ['audio/mp3', 'audio/wav', 'audio/webm']
  },
  any: {
    maxSize: 50 * 1024 * 1024 // 50MB
  }
};

export interface UseAttachmentOptions {
  type?: AttachmentType;
  multiple?: boolean;
  validation?: AttachmentValidation;
  onAttachmentChange?: (files: File[] | null) => void;
}

export function useAttachment({
  type = 'image',
  multiple = false,
  validation = {},
  onAttachmentChange
}: UseAttachmentOptions = {}) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Merge default validation with custom validation
  const validationRules = {
    ...DEFAULT_VALIDATIONS[type],
    ...validation
  };

  const validateFile = (file: File): boolean => {
    // Check file type if types are specified
    if (validationRules.types && validationRules.types.length > 0) {
      if (!validationRules.types.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Tipo de archivo no válido",
          description: `El archivo debe ser ${type === 'image' ? 'una imagen' : 
            type === 'video' ? 'un video' : 
            type === 'audio' ? 'un audio' : 'un archivo válido'}`
        });
        return false;
      }
    }

    // Check file size
    if (validationRules.maxSize && file.size > validationRules.maxSize) {
      const sizeMB = Math.round(validationRules.maxSize / (1024 * 1024));
      toast({
        variant: "destructive",
        title: "Archivo demasiado grande",
        description: `El archivo no debe exceder ${sizeMB}MB`
      });
      return false;
    }

    return true;
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    // Validate each file
    for (const file of fileList) {
      if (validateFile(file)) {
        validFiles.push(file);
        
        // Create preview URL for images
        if (file.type.startsWith('image/')) {
          newPreviews.push(URL.createObjectURL(file));
        } else {
          // Placeholder for non-image files
          newPreviews.push('');
        }
      }
    }

    if (validFiles.length === 0) return;

    if (multiple) {
      // Add new files to existing ones
      setAttachments(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      
      if (onAttachmentChange) {
        onAttachmentChange([...attachments, ...validFiles]);
      }
    } else {
      // Replace existing file with new one
      // Revoke previous preview URLs to avoid memory leaks
      previews.forEach(preview => {
        if (preview) URL.revokeObjectURL(preview);
      });
      
      setAttachments([validFiles[0]]);
      setPreviews([newPreviews[0]]);
      
      if (onAttachmentChange) {
        onAttachmentChange([validFiles[0]]);
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      
      if (onAttachmentChange) {
        onAttachmentChange(updated.length > 0 ? updated : null);
      }
      
      return updated;
    });

    setPreviews(prev => {
      const updated = [...prev];
      if (updated[index]) {
        URL.revokeObjectURL(updated[index]);
      }
      updated.splice(index, 1);
      return updated;
    });
  };

  const clearAttachments = () => {
    // Revoke all preview URLs
    previews.forEach(preview => {
      if (preview) URL.revokeObjectURL(preview);
    });
    
    setAttachments([]);
    setPreviews([]);
    
    if (onAttachmentChange) {
      onAttachmentChange(null);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clean up preview URLs when component unmounts
  const cleanup = () => {
    previews.forEach(preview => {
      if (preview) URL.revokeObjectURL(preview);
    });
  };

  return {
    attachments,
    previews,
    fileInputRef,
    handleAttachmentChange,
    removeAttachment,
    clearAttachments,
    cleanup
  };
}
