
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile, Mic, Image, Loader2 } from "lucide-react";
import { useRef } from "react";
import { motion } from "framer-motion";

interface MessageInputProps {
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onImageUpload?: (file: File) => void;
  isLoading?: boolean;
}

export const MessageInput = ({ 
  newMessage, 
  onMessageChange, 
  onSendMessage,
  onImageUpload,
  isLoading = false
}: MessageInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="p-3 md:p-4 bg-background dark:bg-[#111B21] border-t flex items-center gap-2">
      <div className="flex-shrink-0 flex gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white rounded-full"
        >
          <Smile className="h-5 w-5" />
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
          className="text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Image className="h-5 w-5" />
          )}
        </Button>
      </div>

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
          onKeyDown={handleKeyDown}
          className="flex-1 bg-muted/50 border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/50 rounded-full py-6"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: newMessage ? 1 : 0.8, 
            opacity: newMessage ? 1 : 0,
            width: newMessage ? 'auto' : 0
          }}
          transition={{ duration: 0.2 }}
        >
          <Button 
            type="submit" 
            size="icon" 
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        </motion.div>
      </form>
    </div>
  );
};
