
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MentionsText } from "../MentionsText";

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
      <div className="space-y-2">
        <Textarea
          value={editedContent}
          onChange={(e) => onEditChange(e.target.value)}
          className="min-h-[80px] text-sm"
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={onSaveEdit} disabled={!editedContent.trim()}>
            Guardar
          </Button>
        </div>
      </div>
    );
  }

  if (isAudio && audioUrl) {
    return (
      <div className="mt-2">
        <audio controls src={audioUrl} className="w-full h-8" />
      </div>
    );
  }

  return (
    <div className="mt-1 text-sm">
      <MentionsText content={content} />
    </div>
  );
}
