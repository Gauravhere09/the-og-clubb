
import { useState, useRef, useEffect } from "react";
import { GroupChatHeader } from "./group-chat/GroupChatHeader";
import { GroupMessageList } from "./group-chat/GroupMessageList";
import { GroupMessageInput } from "./group-chat/GroupMessageInput";
import type { GroupMessage } from "@/hooks/use-group-messages";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useAuthCheck } from "@/hooks/use-auth-check";

interface GroupChatProps {
  messages: GroupMessage[];
  currentUserId: string | null;
  onSendMessage: (content: string, type: 'text' | 'audio' | 'image', audioBlob?: Blob) => Promise<void>;
  onClose?: () => void;
}

export const GroupChat = ({ messages, currentUserId, onSendMessage, onClose }: GroupChatProps) => {
  const [isSending, setIsSending] = useState(false);
  const { isAuthenticated } = useAuthCheck();
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Hide navigation on mobile
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

  const handleSendMessage = async (newMessage: string) => {
    if (!newMessage.trim() || isSending) return;
    
    if (!isAuthenticated || !currentUserId) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Debes iniciar sesión para enviar mensajes",
      });
      return;
    }

    try {
      setIsSending(true);
      await onSendMessage(newMessage, 'text');
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

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    if (!isAuthenticated || !currentUserId) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Debes iniciar sesión para enviar imágenes",
      });
      return;
    }
    
    try {
      setIsSending(true);
      await onSendMessage(file.name, 'image', file);
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
  };

  const handleStartRecording = async () => {
    if (!isAuthenticated || !currentUserId) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Debes iniciar sesión para enviar mensajes de audio",
      });
      return;
    }
    
    const stream = await startRecording();
    if (!stream) return;
  };

  const handleStopRecording = async () => {
    const audioBlob = await stopRecording();
    if (!audioBlob) return;
    
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
  };

  return (
    <div className={`flex flex-col h-full ${isMobile ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <GroupChatHeader messagesCount={messages.length} onClose={onClose} />
      
      <GroupMessageList 
        messages={messages} 
        currentUserId={currentUserId} 
      />
      
      <GroupMessageInput
        isRecording={isRecording}
        isSending={isSending}
        fileInputRef={fileInputRef}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onSendMessage={handleSendMessage}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
};
