
import { useState, RefObject } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic, Square, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GroupMessageInputProps {
  isRecording: boolean;
  isSending: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSendMessage: (message: string) => Promise<void>;
  onImageUpload: (file: File) => Promise<void>;
}

export const GroupMessageInput = ({
  isRecording,
  isSending,
  fileInputRef,
  onStartRecording,
  onStopRecording,
  onSendMessage,
  onImageUpload
}: GroupMessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      await onSendMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file)
        .then(() => {
          toast({
            title: "Imagen enviada",
            description: "La imagen se ha enviado correctamente",
          });
        })
        .catch((error) => {
          console.error('Error uploading image:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo enviar la imagen",
          });
        });
    }
  };

  return (
    <div className="p-4 border-t">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isSending}
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        <Input 
          placeholder="Escribe un mensaje..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isSending || isRecording}
          className="flex-1"
        />
        {isRecording ? (
          <Button 
            type="button" 
            variant="destructive" 
            size="icon"
            onClick={onStopRecording}
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            type="button" 
            variant="secondary" 
            size="icon"
            disabled={isSending}
            onClick={onStartRecording}
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}
        <Button 
          type="submit" 
          size="icon" 
          disabled={!newMessage.trim() || isSending || isRecording}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
