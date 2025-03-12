
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { type Comment } from "@/hooks/use-story-comments";

interface StoryCommentsProps {
  comments: Comment[];
  onSendComment: (comment: string) => void;
  onClose: () => void;
  className?: string;
}

export function StoryComments({ comments, onSendComment, onClose, className }: StoryCommentsProps) {
  const [comment, setComment] = useState("");

  const handleSend = () => {
    if (!comment.trim()) return;
    onSendComment(comment);
    setComment("");
  };

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

function CommentsHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-semibold">Comentarios</h3>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function CommentsList({ comments }: { comments: Comment[] }) {
  return (
    <div className="flex-1 overflow-y-auto mb-3 space-y-2">
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay comentarios aún. Sé el primero en comentar.
        </p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <span className="font-semibold text-sm">{comment.username}:</span>
            <span className="text-sm">{comment.text}</span>
          </div>
        ))
      )}
    </div>
  );
}

function CommentInput({ 
  comment, 
  setComment, 
  handleSend 
}: { 
  comment: string;
  setComment: (value: string) => void;
  handleSend: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Añade un comentario..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="flex-1"
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
}
