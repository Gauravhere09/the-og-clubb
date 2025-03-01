
import { useState, useRef, useEffect } from "react";
import { GroupChatHeader } from "./group-chat/GroupChatHeader";
import { GroupMessageList } from "./group-chat/GroupMessageList";
import { GroupMessageInput } from "./group-chat/GroupMessageInput";
import type { GroupMessage } from "@/hooks/use-group-messages";
import { useIsMobile } from "@/hooks/use-mobile";

interface GroupChatProps {
  messages: GroupMessage[];
  currentUserId: string;
  onSendMessage: (content: string, type: 'text' | 'audio' | 'image', audioBlob?: Blob) => Promise<void>;
  onClose?: () => void;
}

export const GroupChat = ({ messages, currentUserId, onSendMessage, onClose }: GroupChatProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

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

    try {
      setIsSending(true);
      await onSendMessage(newMessage, 'text');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (file) {
      try {
        setIsSending(true);
        await onSendMessage(file.name, 'image', file);
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setIsSending(false);
        // Reset the input value to allow uploading the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

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
        } finally {
          setIsSending(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
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
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onSendMessage={handleSendMessage}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
};
