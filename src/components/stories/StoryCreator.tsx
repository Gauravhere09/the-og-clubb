import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Image, X, Plus, Wand2, Pencil, Music, UserPlus, Volume2, Cog, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProfileImage } from "@/hooks/use-profile-image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Visibility = 'public' | 'friends' | 'select';

interface StoryCreatorProps {
  onClose: () => void;
  currentUserId: string;
}

export function StoryCreator({ onClose, currentUserId }: StoryCreatorProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    setIsEditing(true);
  };

  const removeImage = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
    
    if (currentPreviewIndex >= previewUrls.length - 1) {
      setCurrentPreviewIndex(Math.max(0, previewUrls.length - 2));
    }
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

  const handleAddMore = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePrivacyChange = (value: string) => {
    setVisibility(value as Visibility);
  };

  const renderEditTools = () => (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-5">
      <Button variant="secondary" size="icon" className="rounded-full bg-gray-800 text-white">
        <Wand2 className="h-6 w-6" />
      </Button>
      <Button variant="secondary" size="icon" className="rounded-full bg-gray-800 text-white">
        <Pencil className="h-6 w-6" />
      </Button>
      <Button variant="secondary" size="icon" className="rounded-full bg-gray-800 text-white">
        <Music className="h-6 w-6" />
      </Button>
      <Button variant="secondary" size="icon" className="rounded-full bg-gray-800 text-white">
        <UserPlus className="h-6 w-6" />
      </Button>
      <Button variant="secondary" size="icon" className="rounded-full bg-gray-800 text-white">
        <Volume2 className="h-6 w-6" />
      </Button>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md p-0 h-[90vh] max-h-[700px] overflow-hidden">
        {isEditing && previewUrls.length > 0 ? (
          <div className="relative h-full flex flex-col bg-black">
            <div className="flex justify-between items-center p-4 text-white">
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="text-white">
                <X className="h-6 w-6" />
              </Button>
              <div className="font-semibold">
                Editar historia
              </div>
              <div className="w-6"></div> {/* Spacer */}
            </div>

            <div className="flex-1 relative">
              <img 
                src={previewUrls[currentPreviewIndex]} 
                alt="Preview" 
                className="w-full h-full object-contain" 
              />
              {renderEditTools()}
            </div>

            <div className="p-4 bg-black text-white">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 text-white">
                    <Cog className="h-6 w-6" />
                  </Button>
                  <span>Privacidad</span>
                </div>
                <Select value={visibility} onValueChange={handlePrivacyChange}>
                  <SelectTrigger className="w-32 bg-gray-800 border-none text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="friends">Amigos</SelectItem>
                    <SelectItem value="select">Seleccionar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full justify-between"
                onClick={handleSubmit}
                disabled={isUploading}
              >
                <span>Compartir ahora</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <>
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
                          className="w-full h-32 object-cover rounded-md cursor-pointer" 
                          onClick={() => {
                            setCurrentPreviewIndex(index);
                            setIsEditing(true);
                          }}
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
                    onClick={handleAddMore}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir más imágenes
                  </Button>

                  <Button 
                    variant="default"
                    className="w-full"
                    onClick={() => setIsEditing(true)}
                  >
                    Ver historia
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
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Seleccionar imágenes
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
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
                {previewUrls.length > 0 && (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isUploading}
                  >
                    {isUploading ? "Subiendo..." : "Publicar historia"}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
