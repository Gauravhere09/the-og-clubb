
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AudioRecorder } from "./AudioRecorder";
import { useToast } from "@/hooks/use-toast";
import { Image, Video, BarChart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/api";
import { PollCreator } from "./post/PollCreator";

export function PostCreator() {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: submitPost, isPending } = useMutation({
    mutationFn: async (pollData?: { question: string; options: string[] }) => {
      if (!content && !file && !pollData) {
        throw new Error("Debes agregar texto, un archivo multimedia o una encuesta");
      }
      return createPost(content, file, pollData);
    },
    onSuccess: () => {
      setContent("");
      setFile(null);
      setShowPollCreator(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "¡Publicación creada!",
        description: "Tu publicación se ha compartido exitosamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al crear la publicación",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          variant: "destructive",
          title: "Error",
          description: "El archivo es demasiado grande. Máximo 50MB.",
        });
        return;
      }
      setFile(file);
    }
  };

  const handlePollCreate = (pollData: { question: string; options: string[] }) => {
    submitPost(pollData);
  };

  const handleSubmitPost = () => {
    submitPost(undefined); // Pasamos undefined cuando no hay datos de encuesta
  };

  return (
    <Card className="p-4 space-y-4">
      <Textarea
        placeholder="¿Qué estás pensando?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="resize-none"
      />
      {showPollCreator && (
        <PollCreator
          onPollCreate={handlePollCreate}
          onCancel={() => setShowPollCreator(false)}
        />
      )}
      {file && (
        <div className="relative">
          {file.type.startsWith('image/') && (
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          {file.type.startsWith('video/') && (
            <video
              src={URL.createObjectURL(file)}
              controls
              className="w-full rounded-lg"
            />
          )}
          {file.type.startsWith('audio/') && (
            <audio
              src={URL.createObjectURL(file)}
              controls
              className="w-full"
            />
          )}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => setFile(null)}
          >
            Eliminar
          </Button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            <Video className="h-4 w-4" />
          </Button>
          <AudioRecorder onRecordingComplete={(blob) => setFile(new File([blob], "audio.webm", { type: "audio/webm" }))} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPollCreator(true)}
            disabled={isPending}
          >
            <BarChart className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          onClick={handleSubmitPost}
          disabled={isPending || (!content && !file)}
        >
          Publicar
        </Button>
      </div>
    </Card>
  );
}
