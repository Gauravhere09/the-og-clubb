
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CommentContentProps {
  content: string;
  isAudio: boolean;
  audioUrl: string | null;
  isEditing: boolean;
  editedContent: string;
  onEditChange: (value: string) => void;
  onSaveEdit: () => void;
}

export function CommentContent({ 
  content, 
  isAudio, 
  audioUrl, 
  isEditing, 
  editedContent, 
  onEditChange, 
  onSaveEdit 
}: CommentContentProps) {
  if (isEditing) {
    return (
      <div className="mt-1 flex gap-2">
        <Input
          value={editedContent}
          onChange={(e) => onEditChange(e.target.value)}
          className="flex-1 h-7 text-xs"
        />
        <Button size="sm" className="h-7 text-xs py-0" onClick={onSaveEdit}>Guardar</Button>
      </div>
    );
  }

  if (isAudio) {
    return <audio src={audioUrl || undefined} controls className="mt-1 max-w-[180px] h-8" />;
  }

  return <p className="text-xs whitespace-pre-wrap break-words">{content}</p>;
}
