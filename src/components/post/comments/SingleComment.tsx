
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Comment } from "@/types/post";
import { CommentReactions } from "./CommentReactions";
import { useSession } from "@supabase/auth-helpers-react";
import type { ReactionType } from "@/types/database/social.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useCommentMutations } from "@/hooks/use-comment-mutations";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { editComment } = useCommentMutations(comment.post_id);
  const isAuthor = session?.user?.id === comment.user_id;

  const isAudioComment = comment.content.startsWith('[Audio]');
  const audioUrl = isAudioComment ? comment.content.replace('[Audio] ', '') : null;

  const handleSaveEdit = () => {
    if (editedContent.trim() === '') return;
    
    editComment({ 
      commentId: comment.id, 
      content: editedContent 
    }, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  return (
    <div className={`${isReply ? "ml-12" : ""} space-y-1`}>
      <div className="flex items-start gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={comment.profiles?.avatar_url} />
          <AvatarFallback>{comment.profiles?.username?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted p-1.5 rounded-lg">
            <div className="flex justify-between items-start gap-1">
              <p className="font-medium text-xs">{comment.profiles?.username}</p>
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0 hover:bg-accent rounded-full -mt-0.5"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-40"
                  >
                    <DropdownMenuItem 
                      className="cursor-pointer text-xs py-1"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="h-3 w-3 mr-2" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive text-xs py-1"
                      onClick={() => onDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {isEditing ? (
              <div className="mt-1 flex gap-2">
                <Input
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="flex-1 h-7 text-xs"
                />
                <Button size="sm" className="h-7 text-xs py-0" onClick={handleSaveEdit}>Guardar</Button>
              </div>
            ) : (
              <>
                {isAudioComment ? (
                  <audio src={audioUrl || undefined} controls className="mt-1 max-w-[180px] h-8" />
                ) : (
                  <p className="text-xs whitespace-pre-wrap">{comment.content}</p>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <CommentReactions
              commentId={comment.id}
              userReaction={comment.user_reaction as ReactionType | null}
              reactionsCount={comment.likes_count || 0}
              onReaction={onReaction}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => onReply(comment.id, comment.profiles?.username || '')}
            >
              Responder
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
