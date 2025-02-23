
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Video, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function StoryCreator() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máximo 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 50MB.",
      });
      return;
    }

    setIsUploading(true);
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
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          id="story-upload"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <label 
          htmlFor="story-upload" 
          className="flex-1 cursor-pointer"
        >
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="h-5 w-5" />
            <span>Crear estado</span>
          </div>
        </label>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => document.getElementById('story-upload')?.click()}
            disabled={isUploading}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => document.getElementById('story-upload')?.click()}
            disabled={isUploading}
          >
            <Video className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
