
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ThumbsUp, Heart, SmilePlus, Frown, Angry } from "lucide-react";
import type { Comment } from "@/types/post";
import { AudioRecorder } from "../AudioRecorder";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const reactionIcons = {
  'like': <ThumbsUp className="h-3 w-3" />,
  'love': <Heart className="h-3 w-3 text-red-500" />,
  'haha': <SmilePlus className="h-3 w-3 text-yellow-500" />,
  'sad': <Frown className="h-3 w-3 text-blue-500" />,
  'angry': <Angry className="h-3 w-3 text-orange-500" />
};

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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-auto p-0 text-xs ${comment.user_has_liked ? 'text-primary' : ''}`}
                >
                  {reactionIcons[comment.user_reaction || 'like']}
                  <span className="ml-1">{comment.likes?.[0]?.count || 0}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit p-2" align="start">
                <div className="flex gap-1">
                  {Object.entries(reactionIcons).map(([type, icon]) => (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onLike(comment.id)}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
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
