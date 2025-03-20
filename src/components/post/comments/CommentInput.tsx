
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useMentions } from "@/hooks/mentions";
import { MentionSuggestions } from "@/components/mentions/MentionSuggestions";
import { useToast } from "@/hooks/use-toast";
import { CommentTextarea } from "./input/CommentTextarea";
import { ReplyBadge } from "./input/ReplyBadge";
import { ImagePreview } from "./input/ImagePreview";
import { CommentInputHelper } from "./input/CommentInputHelper";
import { MentionButton } from "./input/MentionButton";
import { ImageButton } from "./input/ImageButton";
import { SubmitButton } from "./input/SubmitButton";

interface CommentInputProps {
  newComment: string;
  onNewCommentChange: (value: string) => void;
  onSubmitComment: () => void;
  replyTo: { id: string; username: string } | null;
  onCancelReply: () => void;
  commentImage?: File | null;
  setCommentImage?: (file: File | null) => void;
}

export function CommentInput({ 
  newComment, 
  onNewCommentChange, 
  onSubmitComment, 
  replyTo,
  onCancelReply,
  commentImage,
  setCommentImage
}: CommentInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  
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

  // Actualizar la vista previa cuando cambia la imagen
  useEffect(() => {
    if (commentImage) {
      setImagePreview(URL.createObjectURL(commentImage));
      return () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
      };
    } else {
      setImagePreview(null);
    }
  }, [commentImage]);

  // Update the cursor position whenever it changes
  const handleSelectionChange = () => {
    if (textareaRef.current) {
      handleTextChange(
        newComment, 
        textareaRef.current.selectionStart, 
        textareaRef.current
      );
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('click', handleSelectionChange);
      textarea.addEventListener('keyup', handleSelectionChange);
      
      return () => {
        textarea.removeEventListener('click', handleSelectionChange);
        textarea.removeEventListener('keyup', handleSelectionChange);
      };
    }
  }, [newComment]);

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
    
    // Always trigger the mention handling when text changes
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
          
          // Trigger the text change handler manually
          handleTextChange(newValue, cursorPos + 1, textareaRef.current);
        }
      }, 0);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El archivo debe ser una imagen"
      });
      return;
    }

    // Verificar tamaño máximo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La imagen no debe exceder 5MB"
      });
      return;
    }

    if (setCommentImage) {
      setCommentImage(file);
    }
  };

  const handleRemoveImage = () => {
    if (setCommentImage) {
      setCommentImage(null);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <ReplyBadge replyTo={replyTo} onCancelReply={onCancelReply} />
      
      <ImagePreview imagePreview={imagePreview} onRemoveImage={handleRemoveImage} />
      
      <div className="flex gap-2 flex-col">
        <div className="flex items-center gap-2 relative">
          <CommentTextarea
            ref={textareaRef}
            value={newComment}
            onChange={handleTextAreaChange}
            onKeyDown={handleKeyDown}
            placeholder={replyTo ? `Escribe tu respuesta para ${replyTo.username}...` : "Escribe un comentario..."}
          />
          <SubmitButton 
            onClick={onSubmitComment} 
            disabled={!newComment.trim() && !commentImage}
          />
        </div>
        <CommentInputHelper>
          <MentionButton onClick={handleMentionClick} />
          <ImageButton 
            onImageChange={handleImageChange}
            fileInputRef={fileInputRef}
          />
        </CommentInputHelper>
      </div>
      
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
}
