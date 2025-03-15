
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { X, AtSign } from "lucide-react";
import { useMentions } from "@/hooks/use-mentions";
import { MentionSuggestions } from "@/components/mentions/MentionSuggestions";

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
  
  // Focus the textarea when replying to someone
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  // Add debugging log
  useEffect(() => {
    console.log("Mention list visible:", mentionListVisible);
    console.log("Mention users:", mentionUsers);
  }, [mentionListVisible, mentionUsers]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit comment when pressing Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey && !mentionListVisible) {
      e.preventDefault();
      onSubmitComment();
      return;
    }
    
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
          const newText = insertMention(newComment, mentionUsers[mentionIndex]);
          onNewCommentChange(newText);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setMentionListVisible(false);
      }
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onNewCommentChange(value);
    
    if (textareaRef.current) {
      handleTextChange(value, textareaRef.current.selectionStart, textareaRef.current);
    }
  };

  const handleSelectMention = (user: any) => {
    console.log("Selecting mention:", user);
    const newText = insertMention(newComment, user);
    onNewCommentChange(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleMentionClick = () => {
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart;
      const textBefore = newComment.substring(0, cursorPos);
      const textAfter = newComment.substring(cursorPos);
      
      // Insertamos @ en la posición del cursor
      const newValue = textBefore + '@' + textAfter;
      onNewCommentChange(newValue);
      
      // Enfocamos el textarea y movemos el cursor a la posición después del @
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(cursorPos + 1, cursorPos + 1);
        }
      }, 0);
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
      <div className="flex gap-2 flex-col">
        <div className="flex items-center gap-2 relative">
          <Textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleTextAreaChange}
            onKeyDown={handleKeyDown}
            placeholder={replyTo ? `Escribe tu respuesta para ${replyTo.username}...` : "Escribe un comentario..."}
            className="resize-none min-h-[80px]"
            id="comment-textarea"
            name="comment-textarea"
          />
          <Button onClick={onSubmitComment} disabled={!newComment.trim()}>
            Comentar
          </Button>
          
          <MentionSuggestions
            users={mentionUsers}
            isVisible={mentionListVisible}
            position={mentionPosition}
            selectedIndex={mentionIndex}
            onSelectUser={handleSelectMention}
            onSetIndex={setMentionIndex}
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMentionClick}
            className="text-xs flex items-center gap-1"
          >
            <AtSign className="h-3 w-3" />
            Mencionar
          </Button>
        </div>
      </div>
    </div>
  );
}
