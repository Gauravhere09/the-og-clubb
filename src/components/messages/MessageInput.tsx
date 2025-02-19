
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface MessageInputProps {
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
}

export const MessageInput = ({ newMessage, onMessageChange, onSendMessage }: MessageInputProps) => {
  return (
    <div className="p-4 border-t">
      <form 
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSendMessage();
        }}
      >
        <Input 
          placeholder="Escribe un mensaje..." 
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
