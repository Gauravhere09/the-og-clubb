
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, MoreHorizontal, Reply, Edit, X } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CommentContent } from "./CommentContent";
import { CommentFooter } from "./CommentFooter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Comment } from "@/types/post";
import { ReactionType } from "@/types/database/social.types";

interface SingleCommentProps {
  comment: Comment;
  onReaction: (commentId: string, type: ReactionType) => void;
  onReply: (id: string, username: string) => void;
  onDelete: (commentId: string) => void;
}

export function SingleComment({ comment, onReaction, onReply, onDelete }: SingleCommentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es });
  
  // Determine if the comment has an attached image
  const hasImage = comment.media_url && comment.media_type?.startsWith('image');
  const isAudio = comment.media_type === 'audio';

  // Check if user is the author of the comment
  useState(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    checkUser();
  });

  const isAuthor = currentUserId === comment.user_id;

  const handleEditSave = async () => {
    if (editedContent.trim() === "") return;
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editedContent })
        .eq('id', comment.id);
      
      if (error) throw error;
      
      // Update the local state to reflect the edit
      comment.content = editedContent;
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleReplyClick = () => {
    onReply(comment.id, comment.profiles?.username || "");
  };

  const handleDeleteClick = () => {
    onDelete(comment.id);
  };

  return (
    <div className="flex gap-2 group">
      <Link to={`/profile/${comment.user_id}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.profiles?.avatar_url || ""} alt={comment.profiles?.username} />
          <AvatarFallback>{comment.profiles?.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 space-y-1">
        <div className="bg-muted/30 p-2 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <Link to={`/profile/${comment.user_id}`} className="font-medium hover:underline">
                {comment.profiles?.username}
              </Link>
              <span className="text-xs text-muted-foreground ml-2">{timeAgo}</span>
            </div>
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <CommentContent
            content={comment.content}
            isAudio={isAudio}
            audioUrl={isAudio ? comment.media_url : null}
            isEditing={isEditing}
            editedContent={editedContent}
            onEditChange={setEditedContent}
            onSaveEdit={handleEditSave}
          />
          
          {/* Mostrar imagen adjunta si existe */}
          {hasImage && (
            <div className="mt-2">
              <img 
                src={comment.media_url} 
                alt="Imagen adjunta" 
                className="max-h-60 rounded-md object-contain"
              />
            </div>
          )}
        </div>
        
        <CommentFooter
          commentId={comment.id}
          userReaction={comment.user_reaction}
          reactionsCount={comment.likes_count || 0}
          onReaction={onReaction}
          onReply={handleReplyClick}
        />
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-4 mt-2 space-y-3">
            {comment.replies.map(reply => (
              <SingleComment
                key={reply.id}
                comment={reply}
                onReaction={onReaction}
                onReply={onReply}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
