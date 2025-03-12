
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  username: string;
  text: string;
}

export function useStoryComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();

  const handleSendComment = (commentText: string) => {
    setComments([...comments, {
      id: Date.now().toString(),
      username: "Tú",
      text: commentText
    }]);
    
    toast({
      title: "Comentario enviado",
      description: "Tu comentario ha sido enviado con éxito",
    });
  };

  const toggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  return {
    comments,
    showComments,
    handleSendComment,
    toggleComments,
    setShowComments
  };
}
