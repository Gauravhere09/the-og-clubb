
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile, Mic } from "lucide-react";

interface MessageInputProps {
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
}

export const MessageInput = ({ newMessage, onMessageChange, onSendMessage }: MessageInputProps) => {
  return (
    <div className="p-4 bg-white dark:bg-[#0B141A] border-t border-gray-200 dark:border-[#313D45] flex items-center gap-2">
      <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
        <Smile className="h-6 w-6" />
      </Button>
      <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
        <Paperclip className="h-6 w-6" />
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
          className="flex-1 bg-white dark:bg-[#0B141A] border-gray-200 dark:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-0"
        />
        {newMessage ? (
          <Button type="submit" size="icon" variant="ghost" className="text-[#9b87f5] hover:text-[#7E69AB] dark:hover:bg-[#0B141A]">
            <Send className="h-6 w-6" />
          </Button>
        ) : (
          <Button type="button" size="icon" variant="ghost" className="text-[#9b87f5] hover:text-[#7E69AB] dark:hover:bg-[#0B141A]">
            <Mic className="h-6 w-6" />
          </Button>
        )}
      </form>
    </div>
  );
};

