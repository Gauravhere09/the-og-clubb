
import { useState, useEffect, useRef } from "react";
import { useMentions } from "@/hooks/mentions";
import { useToast } from "@/hooks/use-toast";
import { MentionUser } from "@/hooks/mentions/types";

export function useCommentInput({
  newComment,
  onNewCommentChange,
  replyTo,
  setCommentImage
}: {
  newComment: string;
  onNewCommentChange: (value: string) => void;
  replyTo: { id: string; username: string } | null;
  setCommentImage?: (file: File | null) => void;
}) {
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

  // Update image preview when image changes
  useEffect(() => {
    if (fileInputRef.current?.files?.[0]) {
      setImagePreview(URL.createObjectURL(fileInputRef.current.files[0]));
      return () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
      };
    } else {
      setImagePreview(null);
    }
  }, [fileInputRef.current?.files]);

  // Handle cursor position changes
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
      return true; // Signal to parent that submission should occur
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
    return false; // No submission
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onNewCommentChange(value);
    
    // Always trigger the mention handling when text changes
    if (textareaRef.current) {
      handleTextChange(value, textareaRef.current.selectionStart, textareaRef.current);
    }
  };

  const handleSelectMention = (user: MentionUser) => {
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
      
      // Insert @ at cursor position
      const newValue = textBefore + '@' + textAfter;
      onNewCommentChange(newValue);
      
      // Focus and move cursor after @
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

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El archivo debe ser una imagen"
      });
      return;
    }

    // Check max size (5MB)
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

  return {
    textareaRef,
    containerRef,
    fileInputRef,
    imagePreview,
    mentionUsers,
    mentionListVisible,
    mentionPosition,
    mentionIndex,
    setMentionIndex,
    handleKeyDown,
    handleTextAreaChange,
    handleSelectMention,
    handleMentionClick,
    handleImageChange,
    handleRemoveImage
  };
}
