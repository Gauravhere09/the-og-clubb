
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ThumbsUp } from "lucide-react";
import type { Comment } from "@/types/post";
import { AudioRecorder } from "../AudioRecorder";

interface CommentsProps {
  comments: Comment[];
  onLike: (commentId: string) => void;
  onReply: (id: string, username: string) => void;
  onSubmitComment: () => void;
  onAudioRecording: (blob: Blob) => void;
  newComment: string;
  onNewCommentChange: (value: string) => void;
  replyTo: { id: string; username: string } | null;
  onCancelReply: () => void;
}

export function Comments({
  comments,
  onLike,
  onReply,
  onSubmitComment,
  onAudioRecording,
  newComment,
  onNewCommentChange,
  replyTo,
  onCancelReply
}: CommentsProps) {
  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? "ml-12" : ""} space-y-2`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.profiles?.avatar_url} />
          <AvatarFallback>{comment.profiles?.username?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted p-3 rounded-lg">
            <p className="font-medium text-sm">{comment.profiles?.username}</p>
            {comment.content.startsWith('[Audio]') ? (
              <audio 
                src={comment.content.replace('[Audio] ', '')} 
                controls 
                className="mt-2 max-w-[200px]"
              />
            ) : (
              <p className="text-sm">{comment.content}</p>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-auto p-0 text-xs ${comment.user_has_liked ? 'text-primary' : ''}`}
              onClick={() => onLike(comment.id)}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {comment.likes?.[0]?.count || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => onReply(comment.id, comment.profiles?.username || "")}
            >
              Responder
            </Button>
            <span className="text-xs text-muted-foreground">
              {format(new Date(comment.created_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
            </span>
          </div>
        </div>
      </div>
      {comment.replies?.map((reply) => renderComment(reply, true))}
    </div>
  );

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-4">
        {comments.map((comment) => renderComment(comment))}
      </div>

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
    </div>
  );
}
