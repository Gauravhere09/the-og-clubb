
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
    <div className="p-4 bg-[#1F2C33] flex items-center gap-2">
      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
        <Smile className="h-6 w-6" />
      </Button>
      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
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
          className="flex-1 bg-[#2A3942] border-0 text-white placeholder:text-gray-400 focus-visible:ring-0"
        />
        {newMessage ? (
          <Button type="submit" size="icon" variant="ghost" className="text-[#00A884] hover:text-[#00A884] hover:bg-[#2A3942]">
            <Send className="h-6 w-6" />
          </Button>
        ) : (
          <Button type="button" size="icon" variant="ghost" className="text-[#00A884] hover:text-[#00A884] hover:bg-[#2A3942]">
            <Mic className="h-6 w-6" />
          </Button>
        )}
      </form>
    </div>
  );
};
