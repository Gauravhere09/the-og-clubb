
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AudioRecorder } from "./AudioRecorder";
import { useToast } from "@/hooks/use-toast";

export function PostCreator() {
  const [content, setContent] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  const handlePost = () => {
    if (!content && !audioBlob) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Agrega texto o un audio para publicar",
      });
      return;
    }
    
    // Here we would handle the post creation
    toast({
      title: "Publicación creada",
      description: "Tu publicación se ha compartido exitosamente",
    });
    
    setContent("");
    setAudioBlob(null);
  };

  return (
    <Card className="p-4 space-y-4">
      <Textarea
        placeholder="¿Qué estás pensando?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="resize-none"
      />
      <div className="flex items-center justify-between">
        <AudioRecorder onRecordingComplete={setAudioBlob} />
        <Button onClick={handlePost}>Publicar</Button>
      </div>
    </Card>
  );
}
