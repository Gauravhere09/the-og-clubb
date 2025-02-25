
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Smile } from "lucide-react";
import { useState } from "react";

interface StoryFooterProps {
  message: string;
  isSubmitting: boolean;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onReaction: () => void;
}

export function StoryFooter({ 
  message, 
  isSubmitting, 
  onMessageChange, 
  onSendMessage,
  onReaction 
}: StoryFooterProps) {
  const [showCommentInput, setShowCommentInput] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/20"
        onClick={onReaction}
        disabled={isSubmitting}
      >
        <Smile className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/20"
        onClick={() => setShowCommentInput(!showCommentInput)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {showCommentInput && (
        <>
          <Input
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            placeholder="Enviar comentario..."
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            disabled={isSubmitting}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onSendMessage}
            disabled={!message.trim() || isSubmitting}
          >
            <Send className="h-6 w-6" />
          </Button>
        </>
      )}
    </div>
  );
}
