
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Image, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProfileImage } from "@/hooks/use-profile-image";

interface StoryCreatorProps {
  onClose: () => void;
  currentUserId: string;
}

export function StoryCreator({ onClose, currentUserId }: StoryCreatorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { loading, handleImageUpload } = useProfileImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const selectedFile = e.target.files[0];
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        variant: "destructive",
        title: "Error",
        description: "La imagen es demasiado grande. Máximo 10MB.",
      });
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Solo se permiten imágenes para las historias.",
      });
      return;
    }

    setFile(selectedFile);
    
    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar una imagen para tu historia.",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // En una implementación real, aquí subiríamos la historia a Supabase
      // y la marcaríamos para que expire después de 24 horas
      
      // Simulamos un tiempo de carga
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "¡Historia creada!",
        description: "Tu historia estará disponible durante 24 horas.",
      });
      
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la historia. Inténtalo de nuevo.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear historia</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {previewUrl ? (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-auto rounded-md object-cover max-h-[60vh]" 
              />
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 bg-muted rounded-md border-2 border-dashed border-muted-foreground/25">
              <div className="flex flex-col items-center justify-center space-y-2">
                <Image className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arrastra una imagen o haz clic para subirla
                </p>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => document.getElementById('story-file')?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Seleccionar imagen
                </Button>
              </div>
              <input
                id="story-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!file || isUploading}
            >
              {isUploading ? "Subiendo..." : "Publicar historia"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
