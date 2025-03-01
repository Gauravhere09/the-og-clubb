
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile, Mic, Image } from "lucide-react";
import { useRef } from "react";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-[#111B21] border-t border-gray-200 dark:border-[#313D45] flex items-center gap-2">
      <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
        <Smile className="h-6 w-6" />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
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
      <form 
        className="flex-1 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSendMessage();
        }}
      >
        <Input 
          placeholder="Escribe un mensaje" 
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          className="flex-1 bg-white dark:bg-[#111B21] border-gray-200 dark:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-0"
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
    </div>
  );
};
