
import { useToast } from "@/hooks/use-toast";
import { uploadProfileImage } from "@/lib/api/profile";

export function useProfileImage() {
  const { toast } = useToast();

  const handleImageUpload = async (type: 'avatar' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || !e.target.files[0]) return;

      const file = e.target.files[0];
      const publicUrl = await uploadProfileImage(file, type);

      toast({
        title: "Imagen actualizada",
        description: "La imagen se ha actualizado correctamente",
      });

      window.location.reload();
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar la imagen",
      });
    }
  };

  return { handleImageUpload };
}
