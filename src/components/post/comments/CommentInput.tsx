
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface CommentInputProps {
  newComment: string;
  onNewCommentChange: (value: string) => void;
  onSubmitComment: () => void;
  replyTo: { id: string; username: string } | null;
  onCancelReply: () => void;
}

export function CommentInput({ 
  newComment, 
  onNewCommentChange, 
  onSubmitComment, 
  replyTo,
  onCancelReply
}: CommentInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus the textarea when replying to someone
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit comment when pressing Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmitComment();
    }
  };

  return (
    <div className="space-y-2">
      {replyTo && (
        <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md text-sm">
          <span className="text-muted-foreground">
            Respondiendo a <span className="font-medium text-foreground">@{replyTo.username}</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={onCancelReply}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={newComment}
          onChange={(e) => onNewCommentChange(e.target.value)}
          placeholder={replyTo ? `Escribe tu respuesta para ${replyTo.username}...` : "Escribe un comentario..."}
          className="resize-none min-h-[80px]"
          onKeyDown={handleKeyDown}
          id="comment-textarea"
          name="comment-textarea"
        />
        <Button onClick={onSubmitComment} disabled={!newComment.trim()}>
          Comentar
        </Button>
      </div>
      <div className="text-xs text-muted-foreground">
        Presiona Enter para enviar, Shift+Enter para nueva línea
      </div>
    </div>
  );
}
