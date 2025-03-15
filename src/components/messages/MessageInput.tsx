
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile, Mic, Image, AtSign } from "lucide-react";
import { useRef, useState } from "react";
import { useMentions } from "@/hooks/use-mentions";
import { MentionSuggestions } from "@/components/mentions/MentionSuggestions";

interface MessageInputProps {
  newMessage: string;
  isTyping?: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onImageUpload?: (file: File) => Promise<void>;
}

export const MessageInput = ({ 
  newMessage, 
  isTyping,
  onMessageChange, 
  onSendMessage,
  onImageUpload 
}: MessageInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onMessageChange(value);
    
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
          onMessageChange(newText);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setMentionListVisible(false);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleSelectMention = (user: any) => {
    const newText = insertMention(newMessage, user);
    onMessageChange(newText);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleMentionClick = () => {
    if (inputRef.current) {
      const cursorPos = inputRef.current.selectionStart;
      const textBefore = newMessage.substring(0, cursorPos);
      const textAfter = newMessage.substring(cursorPos);
      
      // Insert @ at cursor position
      const newValue = textBefore + '@' + textAfter;
      onMessageChange(newValue);
      
      // Focus the input and move cursor after @
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(cursorPos + 1, cursorPos + 1);
        }
      }, 0);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-[#111B21] border-t border-gray-200 dark:border-[#313D45] flex items-center gap-2 relative">
      <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
        <Smile className="h-6 w-6" />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        id="message-image-upload"
        name="message-image-upload"
        className="hidden"
      />
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
        onClick={() => fileInputRef.current?.click()}
      >
        <Image className="h-6 w-6" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
        onClick={handleMentionClick}
      >
        <AtSign className="h-6 w-6" />
      </Button>
      <form 
        className="flex-1 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSendMessage();
        }}
        id="message-form"
        name="message-form"
      >
        <Input 
          ref={inputRef}
          placeholder="Escribe un mensaje" 
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 bg-white dark:bg-[#111B21] border-gray-200 dark:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-0"
          id="new-message"
          name="new-message"
        />
        
        {newMessage ? (
          <Button type="submit" size="icon" variant="ghost" className="text-[#9b87f5] hover:text-[#7E69AB] dark:hover:bg-[#111B21]">
            <Send className="h-6 w-6" />
          </Button>
        ) : (
          <Button type="button" size="icon" variant="ghost" className="text-[#9b87f5] hover:text-[#7E69AB] dark:hover:bg-[#111B21]">
            <Mic className="h-6 w-6" />
          </Button>
        )}
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
