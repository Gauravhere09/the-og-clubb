
import { AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatarDisplay } from "./UserAvatarDisplay";
import { PostContentInput } from "./PostContentInput";
import { RefObject } from "react";
import { MentionPosition, MentionUser } from "@/hooks/mentions/types";
import { Post } from "@/types/post";
import { Link } from "react-router-dom";

interface PostHeaderProps {
  currentUser?: { 
    id: string;
    avatar_url: string | null;
    username: string | null;
  } | null;
  content: string;
  textareaRef?: RefObject<HTMLTextAreaElement>;
  mentionUsers?: MentionUser[];
  mentionListVisible?: boolean;
  mentionPosition?: MentionPosition;
  mentionIndex?: number;
  handleTextAreaChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSelectMention?: (user: MentionUser) => void;
  handleMentionClick?: () => void;
  setMentionIndex?: (index: number) => void;
  // Add properties needed for Post.tsx usage
  post?: Post;
  onDelete?: () => void;
  isAuthor?: boolean;
  isHidden?: boolean;
}

export function PostHeader({
  currentUser,
  content,
  textareaRef,
  mentionUsers = [],
  mentionListVisible = false,
  mentionPosition,
  mentionIndex = 0,
  handleTextAreaChange,
  handleKeyDown,
  handleSelectMention,
  handleMentionClick,
  setMentionIndex,
  // Default values for Post.tsx usage
  post,
  onDelete,
  isAuthor,
  isHidden
}: PostHeaderProps) {
  // If post is provided, this is being used in Post.tsx context
  if (post) {
    // Render the Post header UI
    return (
      <div className="flex items-center justify-between mb-2">
        {/* Render Post-specific header content */}
        <div className="flex items-center gap-2">
          <Link to={`/profile/${post.user_id}`}>
            <UserAvatarDisplay 
              currentUser={post.profiles ? {
                id: post.user_id,
                avatar_url: post.profiles.avatar_url,
                username: post.profiles.username
              } : null} 
            />
          </Link>
          <div>
            <Link to={`/profile/${post.user_id}`} className="font-medium hover:underline">
              {post.profiles?.username || 'Usuario'}
            </Link>
            <p className="text-xs text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {isAuthor && !isHidden && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete}
            className="text-destructive hover:text-destructive/90"
          >
            Eliminar
          </Button>
        )}
      </div>
    );
  }
  
  // Original PostCreator UI
  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <UserAvatarDisplay currentUser={currentUser} />
        
        <PostContentInput
          content={content}
          textareaRef={textareaRef}
          handleTextAreaChange={handleTextAreaChange}
          handleKeyDown={handleKeyDown}
          mentionUsers={mentionUsers}
          mentionListVisible={mentionListVisible}
          mentionPosition={mentionPosition}
          mentionIndex={mentionIndex}
          onSelectUser={handleSelectMention}
          onSetIndex={setMentionIndex}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleMentionClick}
          className="text-sm flex items-center gap-1"
        >
          <span className="sr-only">Mencionar</span>
          <AtSign className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
