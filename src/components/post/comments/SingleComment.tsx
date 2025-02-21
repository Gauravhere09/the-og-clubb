
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Trash } from "lucide-react";
import type { Comment } from "@/types/post";
import { CommentReactions } from "./CommentReactions";
import { useSession } from "@supabase/auth-helpers-react";
import type { ReactionType } from "@/lib/api/likes";

interface SingleCommentProps {
  comment: Comment;
  onReaction: (commentId: string, type: ReactionType) => void;
  onReply: (id: string, username: string) => void;
  onDeleteComment: (commentId: string) => void;
  isReply?: boolean;
}

export function SingleComment({ 
  comment, 
  onReaction, 
  onReply, 
  onDeleteComment,
  isReply = false 
}: SingleCommentProps) {
  const session = useSession();

  const isAudioComment = comment.content.startsWith('[Audio]');
  const audioUrl = isAudioComment ? comment.content.replace('[Audio] ', '') : null;

  return (
    <div className={`${isReply ? "ml-12" : ""} space-y-2`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.profiles?.avatar_url} />
          <AvatarFallback>{comment.profiles?.username?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted p-3 rounded-lg">
            <p className="font-medium text-sm">{comment.profiles?.username}</p>
            {isAudioComment ? (
              <audio 
                src={audioUrl} 
                controls 
                className="mt-2 w-full max-w-[300px]"
                preload="metadata"
              />
            ) : (
              <p className="text-sm">{comment.content}</p>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <CommentReactions
              commentId={comment.id}
              userReaction={comment.user_reaction}
              reactionsCount={comment.likes?.[0]?.count || 0}
              onReaction={onReaction}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => onReply(comment.id, comment.profiles?.username || "")}
            >
              Responder
            </Button>
            {session?.user?.id === comment.user_id && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                onClick={() => onDeleteComment(comment.id)}
              >
                <Trash className="h-3 w-3" />
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              {format(new Date(comment.created_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
            </span>
          </div>
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <SingleComment
          key={reply.id}
          comment={reply}
          onReaction={onReaction}
          onReply={onReply}
          onDeleteComment={onDeleteComment}
          isReply
        />
      ))}
    </div>
  );
}
