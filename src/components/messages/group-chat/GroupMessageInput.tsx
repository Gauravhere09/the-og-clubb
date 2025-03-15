
import { useState, RefObject, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic, Square, Image as ImageIcon, AtSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMentions } from "@/hooks/mentions";
import { MentionSuggestions } from "@/components/mentions/MentionSuggestions";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    mentionUsers,
    mentionListVisible,
    mentionPosition,
    mentionIndex,
    setMentionIndex,
    handleTextChange,
    insertMention,
    setMentionListVisible
  } = useMentions();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (inputRef.current) {
      handleTextChange(value, inputRef.current.selectionStart, inputRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle mention selection with keyboard navigation
    if (mentionListVisible && mentionUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % mentionUsers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev <= 0 ? mentionUsers.length - 1 : prev - 1));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (mentionIndex >= 0 && mentionIndex < mentionUsers.length) {
          const newText = insertMention(newMessage, mentionUsers[mentionIndex]);
          setNewMessage(newText);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setMentionListVisible(false);
      }
    } else if (e.key === 'Enter' && !mentionListVisible) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSelectMention = (user: any) => {
    const newText = insertMention(newMessage, user);
    setNewMessage(newText);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleMentionClick = () => {
    if (inputRef.current) {
      const cursorPos = inputRef.current.selectionStart || 0;
      const textBefore = newMessage.substring(0, cursorPos);
      const textAfter = newMessage.substring(cursorPos);
      
      // Insert @ symbol at cursor position
      const updatedMessage = textBefore + '@' + textAfter;
      setNewMessage(updatedMessage);
      
      // Focus input and position cursor after the @ symbol
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(cursorPos + 1, cursorPos + 1);
        }
      }, 0);
    }
  };

  return (
    <div className="p-4 border-t relative">
      <form onSubmit={handleSubmit} className="flex gap-2" id="group-message-form" name="group-message-form">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          id="group-message-image"
          name="group-message-image"
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isSending || isRecording}
          onClick={handleMentionClick}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
        >
          <AtSign className="h-5 w-5" />
        </Button>
        <Input 
          ref={inputRef}
          placeholder="Escribe un mensaje..." 
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isSending || isRecording}
          className="flex-1"
          id="group-new-message"
          name="group-new-message"
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
      
      <MentionSuggestions
        users={mentionUsers}
        isVisible={mentionListVisible}
        position={mentionPosition}
        selectedIndex={mentionIndex}
        onSelectUser={handleSelectMention}
        onSetIndex={setMentionIndex}
      />
    </div>
  );
};
