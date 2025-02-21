
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AudioRecorder } from "@/components/AudioRecorder";

interface CommentInputProps {
  newComment: string;
  onNewCommentChange: (value: string) => void;
  onSubmitComment: () => void;
  onAudioRecording: (blob: Blob) => void;
  replyTo: { id: string; username: string } | null;
  onCancelReply: () => void;
}

export function CommentInput({ 
  newComment, 
  onNewCommentChange, 
  onSubmitComment, 
  onAudioRecording,
  replyTo,
  onCancelReply
}: CommentInputProps) {
  return (
    <div className="space-y-2">
      {replyTo && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Respondiendo a @{replyTo.username}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={onCancelReply}
          >
            Cancelar
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => onNewCommentChange(e.target.value)}
            placeholder="Escribe un comentario..."
            className="resize-none"
          />
          <Button onClick={onSubmitComment}>
            Comentar
          </Button>
        </div>
        <AudioRecorder onRecordingComplete={onAudioRecording} />
      </div>
    </div>
  );
}
