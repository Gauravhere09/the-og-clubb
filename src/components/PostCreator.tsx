
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/api";
import { PollCreator } from "./post/PollCreator";
import { PostActionButtons } from "./post/PostActionButtons";
import { FilePreview } from "./post/FilePreview";
import { VisibilitySelector } from "./post/VisibilitySelector";

export function PostCreator() {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: submitPost, isPending } = useMutation({
    mutationFn: async (pollData?: { question: string; options: string[] }) => {
      if (!content && !file && !pollData) {
        throw new Error("Debes agregar texto, un archivo multimedia o una encuesta");
      }
      return createPost({
        content,
        file,
        pollData,
        visibility
      });
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

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        variant: "destructive",
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 50MB.",
      });
      return;
    }
    setFile(selectedFile);
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
      
      <VisibilitySelector 
        visibility={visibility} 
        onVisibilityChange={setVisibility} 
      />
      
      {showPollCreator && (
        <PollCreator
          onPollCreate={handlePollCreate}
          onCancel={() => setShowPollCreator(false)}
        />
      )}
      
      {file && (
        <FilePreview 
          file={file} 
          onRemove={() => setFile(null)} 
        />
      )}
      
      <div className="flex items-center justify-between">
        <PostActionButtons 
          onFileSelect={handleFileChange}
          onPollCreate={() => setShowPollCreator(true)}
          isPending={isPending}
        />
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
