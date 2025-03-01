
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic, Square, Image as ImageIcon, MoreVertical, Trash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { GroupMessage } from "@/hooks/use-group-messages";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface GroupChatProps {
  messages: GroupMessage[];
  currentUserId: string;
  onSendMessage: (content: string, type: 'text' | 'audio' | 'image', audioBlob?: Blob) => Promise<void>;
  onClose?: () => void;
}

export const GroupChat = ({ messages, currentUserId, onSendMessage, onClose }: GroupChatProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        try {
          setIsSending(true);
          await onSendMessage('', 'audio', audioBlob);
        } catch (error) {
          console.error('Error sending audio message:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo enviar el mensaje de audio",
          });
        } finally {
          setIsSending(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo acceder al micrófono",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      await onSendMessage(newMessage, 'text');
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsSending(true);
        await onSendMessage(file.name, 'image', file);
        toast({
          title: "Imagen enviada",
          description: "La imagen se ha enviado correctamente",
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo enviar la imagen",
        });
      } finally {
        setIsSending(false);
        // Reset the input value to allow uploading the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Verificar que el mensaje pertenece al usuario actual
      const messageToDelete = messages.find(msg => msg.id === messageId);
      
      if (!messageToDelete) {
        throw new Error("Mensaje no encontrado");
      }
      
      if (messageToDelete.sender_id !== currentUserId) {
        throw new Error("No tienes permiso para eliminar este mensaje");
      }
      
      // Eliminar el mensaje
      const { error } = await supabase
        .from('group_messages')
        .delete()
        .eq('id', messageId);
        
      if (error) throw error;
      
      toast({
        title: "Mensaje eliminado",
        description: "El mensaje ha sido eliminado con éxito",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el mensaje",
      });
    }
  };

  useEffect(() => {
    const nav = document.querySelector('nav');
    if (nav && window.innerWidth < 768) {
      nav.style.display = 'none';
    }

    return () => {
      const nav = document.querySelector('nav');
      if (nav) {
        nav.style.display = 'flex';
      }
    };
  }, []);

  return (
    <div className={`flex flex-col h-full ${isMobile ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <div className="p-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#9b87f5]">H</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">Red H</h2>
            <p className="text-xs text-muted-foreground">Chat grupal ({messages.length} mensajes)</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Volver
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay mensajes aún. ¡Sé el primero en enviar uno!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div className="flex gap-2">
                  {message.sender_id !== currentUserId && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender?.avatar_url || undefined} />
                      <AvatarFallback>{message.sender?.username?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="relative group">
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender_id === currentUserId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.type === 'audio' ? (
                        <audio src={message.media_url || undefined} controls className="max-w-[200px]" />
                      ) : message.type === 'image' ? (
                        <img src={message.media_url || undefined} alt="Imagen enviada" className="max-w-[200px] rounded" />
                      ) : (
                        <p>{message.content}</p>
                      )}
                      <div
                        className={`text-xs mt-1 ${
                          message.sender_id === currentUserId 
                            ? "text-primary-foreground/70" 
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.sender?.username || 'Usuario'} • {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    {/* Opción para eliminar mensaje (solo para mensajes propios) */}
                    {message.sender_id === currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className={`h-4 w-4 ${
                            message.sender_id === currentUserId 
                              ? "text-primary-foreground/70" 
                              : "text-muted-foreground"
                          }`} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Eliminar mensaje
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
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
              onClick={stopRecording}
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="button" 
              variant="secondary" 
              size="icon"
              disabled={isSending}
              onClick={startRecording}
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
    </div>
  );
};
