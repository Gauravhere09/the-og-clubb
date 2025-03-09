
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function ImageModal({ isOpen, onClose, imageUrl }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden flex items-center justify-center bg-transparent border-none">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 z-50 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-all"
          aria-label="Cerrar"
        >
          <X className="h-6 w-6" />
        </button>
        <img 
          src={imageUrl} 
          alt="Imagen ampliada" 
          className="max-w-full max-h-[85vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </DialogContent>
    </Dialog>
  );
}
