
import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Mic, X } from "lucide-react";
import { AudioRecorder } from "@/components/AudioRecorder";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StoryCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StoryCreatorModal({ isOpen, onClose, onSuccess }: StoryCreatorModalProps) {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "audio" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 50MB.",
      });
      return;
    }

    const fileType = file.type.split('/')[0];
    if (fileType !== 'image' && fileType !== 'audio') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Tipo de archivo no soportado",
      });
      return;
    }

    setMediaFile(file);
    setMediaType(fileType as "image" | "audio");

    if (fileType === 'image') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      let mediaUrl = '';
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(`stories/${fileName}`, mediaFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(`stories/${fileName}`);
        
        mediaUrl = publicUrl;
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await supabase
        .from('posts')
        .insert({
          content,
          media_url: mediaUrl,
          media_type: mediaType,
          user_id: user.id,
          visibility: 'public',
          is_story: true,
          expires_at: expiresAt.toISOString()
        });

      toast({
        title: "¡Historia creada!",
        description: "Tu historia se ha publicado correctamente",
      });

      handleReset();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating story:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la historia",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setContent("");
    setMediaFile(null);
    setPreviewUrl("");
    setMediaType(null);
    onClose();
  };

  const handleAudioRecorded = (blob: Blob) => {
    const file = new File([blob], "audio-story.webm", { type: "audio/webm" });
    setMediaFile(file);
    setMediaType("audio");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Crear historia</h2>
          <Button variant="ghost" size="icon" onClick={handleReset}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="¿Qué quieres compartir?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />

          {mediaType === 'image' && previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setMediaFile(null);
                  setPreviewUrl("");
                  setMediaType(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {mediaType === 'audio' && mediaFile && (
            <div className="bg-secondary rounded-lg p-3 flex items-center justify-between">
              <audio src={URL.createObjectURL(mediaFile)} controls className="w-full" />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  setMediaFile(null);
                  setMediaType(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,audio/*"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!!mediaFile}
            >
              <Image className="h-4 w-4 mr-2" />
              Imagen
            </Button>
            {!mediaFile && (
              <AudioRecorder onRecordingComplete={handleAudioRecorded} />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={(!content && !mediaFile) || isSubmitting}
            >
              Publicar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
