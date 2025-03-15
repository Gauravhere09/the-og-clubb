
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X } from "lucide-react";
import { useState, useCallback, memo, useRef } from "react";
import { cn } from "@/lib/utils";
import { type Comment } from "@/hooks/use-story-comments";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StoryCommentsProps {
  comments: Comment[];
  onSendComment: (comment: string) => void;
  onClose: () => void;
  className?: string;
}

export function StoryComments({ comments, onSendComment, onClose, className }: StoryCommentsProps) {
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const handleSend = useCallback(async () => {
    if (!comment.trim()) return;
    
    // Check authentication before sending comment
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para comentar",
      });
      return;
    }
    
    onSendComment(comment);
    setComment("");
  }, [comment, onSendComment, toast]);

  return (
    <div 
      className={cn("absolute bottom-0 left-0 right-0 bg-background rounded-t-lg p-4 h-1/3 flex flex-col", className)} 
      onClick={(e) => e.stopPropagation()}
    >
      <CommentsHeader onClose={onClose} />
      <CommentsList comments={comments} />
      <CommentInput 
        comment={comment}
        setComment={setComment}
        handleSend={handleSend}
      />
    </div>
  );
}

const CommentsHeader = memo(({ onClose }: { onClose: () => void }) => {
  return (
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-semibold">Comentarios</h3>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
});
CommentsHeader.displayName = "CommentsHeader";

const CommentsList = memo(({ comments }: { comments: Comment[] }) => {
  return (
    <div className="flex-1 overflow-y-auto mb-3 space-y-2">
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay comentarios aún. Sé el primero en comentar.
        </p>
      ) : (
        comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))
      )}
    </div>
  );
});
CommentsList.displayName = "CommentsList";

const CommentItem = memo(({ comment }: { comment: Comment }) => {
  const [isCopying, setIsCopying] = useState(false);
  const longPressTimer = useRef<number | null>(null);

  const handleLongPressStart = () => {
    // Start a timer for long press
    longPressTimer.current = window.setTimeout(() => {
      setIsCopying(true);
      copyCommentText();
    }, 800); // 800ms for long press
  };

  const handleLongPressEnd = () => {
    // Clear the timer if touch ends
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsCopying(false);
  };

  const copyCommentText = () => {
    // Create a temporary indicator
    const indicator = document.createElement('div');
    indicator.className = 'copying-indicator active';
    indicator.textContent = 'Comentario copiado';
    document.body.appendChild(indicator);
    
    // Copy to clipboard
    try {
      navigator.clipboard.writeText(comment.text).then(() => {
        console.log('Copied to clipboard');
        
        // Remove the indicator after a delay
        setTimeout(() => {
          indicator.classList.remove('active');
          setTimeout(() => {
            document.body.removeChild(indicator);
          }, 200);
        }, 1500);
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div 
      className="flex gap-2"
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
      onTouchCancel={handleLongPressEnd}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
    >
      <span className="font-semibold text-sm">{comment.username}:</span>
      <span className={`text-sm comment-text-selectable ${isCopying ? 'pulse-on-hold' : ''}`}>{comment.text}</span>
      {comment.timestamp && (
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
});
CommentItem.displayName = "CommentItem";

interface CommentInputProps {
  comment: string;
  setComment: (value: string) => void;
  handleSend: () => void;
}

const CommentInput = memo(({ comment, setComment, handleSend }: CommentInputProps) => {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Añade un comentario..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="flex-1 comment-text-selectable"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSend();
          }
        }}
      />
      <Button size="icon" onClick={handleSend}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
});
CommentInput.displayName = "CommentInput";
