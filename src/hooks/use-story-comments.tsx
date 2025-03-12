
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp?: string;
}

interface UseStoryCommentsOptions {
  initialComments?: Comment[];
  onCommentAdd?: (comment: Comment) => void;
}

/**
 * Custom hook for managing story comments state and actions
 */
export function useStoryComments(options: UseStoryCommentsOptions = {}) {
  const { initialComments = [], onCommentAdd } = options;
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();

  const handleSendComment = useCallback((commentText: string) => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      username: "Tú",
      text: commentText,
      timestamp: new Date().toISOString()
    };
    
    setComments(prevComments => [...prevComments, newComment]);
    
    if (onCommentAdd) {
      onCommentAdd(newComment);
    }
    
    toast({
      title: "Comentario enviado",
      description: "Tu comentario ha sido enviado con éxito",
    });
  }, [onCommentAdd, toast]);

  const toggleComments = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(prevState => !prevState);
  }, []);

  const closeComments = useCallback(() => {
    setShowComments(false);
  }, []);

  return {
    comments,
    showComments,
    handleSendComment,
    toggleComments,
    closeComments,
    setShowComments
  };
}
