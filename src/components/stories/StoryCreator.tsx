
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export class StoryCreator {
  async handleFile(file: File) {
    const { toast } = useToast();

    // Validar tamaño (máximo 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 50MB.",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(`stories/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(`stories/${fileName}`);

      await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: '',
          media_url: publicUrl,
          media_type: file.type.startsWith('image/') ? 'image' : 'video',
          visibility: 'public',
          is_story: true,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      toast({
        title: "¡Estado creado!",
        description: "Tu estado se ha publicado correctamente",
      });
    } catch (error) {
      console.error('Error uploading story:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir el estado",
      });
    }
  }
}
