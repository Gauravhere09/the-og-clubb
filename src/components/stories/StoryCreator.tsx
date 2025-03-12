
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Image, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProfileImage } from "@/hooks/use-profile-image";

interface StoryCreatorProps {
  onClose: () => void;
  currentUserId: string;
}

export function StoryCreator({ onClose, currentUserId }: StoryCreatorProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { loading, handleImageUpload } = useProfileImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const newFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    Array.from(e.target.files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: "destructive",
          title: "Error",
          description: "Una imagen es demasiado grande. Máximo 10MB.",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Solo se permiten imágenes para las historias.",
        });
        return;
      }

      newFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    });

    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar al menos una imagen para tu historia.",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // En una implementación real, aquí subiríamos las imágenes a Supabase
      // y las marcaríamos para que expiren después de 24 horas
      
      // Simulamos un tiempo de carga
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "¡Historia creada!",
        description: `Tu historia con ${files.length} imagen${files.length > 1 ? 'es' : ''} estará disponible durante 24 horas.`,
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
          {previewUrls.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-md" 
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => document.getElementById('story-file')?.click()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir más imágenes
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 bg-muted rounded-md border-2 border-dashed border-muted-foreground/25">
              <div className="flex flex-col items-center justify-center space-y-2">
                <Image className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arrastra imágenes o haz clic para subirlas
                </p>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => document.getElementById('story-file')?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Seleccionar imágenes
                </Button>
              </div>
              <input
                id="story-file"
                type="file"
                accept="image/*"
                multiple
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
              disabled={files.length === 0 || isUploading}
            >
              {isUploading ? "Subiendo..." : "Publicar historia"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
