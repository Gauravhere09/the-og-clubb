
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Post } from "@/types/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostOptionsMenu } from "./actions/PostOptionsMenu";
import { MentionSuggestions } from "@/components/mentions/MentionSuggestions";
import { MentionUser, MentionPosition } from "@/hooks/mentions/types";
import { Textarea } from "@/components/ui/textarea";

interface PostHeaderProps {
  post?: Post; // Make post optional
  onDelete?: () => void;
  isAuthor?: boolean;
  isHidden?: boolean;
  content?: string;
  // Props for post creator view
  currentUser?: { id: string; avatar_url: string | null; username: string | null };
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  mentionUsers?: MentionUser[];
  mentionListVisible?: boolean;
  mentionPosition?: MentionPosition;
  mentionIndex?: number;
  handleTextAreaChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSelectMention?: (user: MentionUser) => void;
  handleMentionClick?: () => void;
  setMentionIndex?: React.Dispatch<React.SetStateAction<number>>;
}

export function PostHeader({ 
  post, 
  onDelete, 
  isAuthor = false,
  isHidden = false,
  content,
  currentUser,
  textareaRef,
  mentionUsers,
  mentionListVisible,
  mentionPosition,
  mentionIndex,
  handleTextAreaChange,
  handleKeyDown,
  handleSelectMention,
  handleMentionClick,
  setMentionIndex
}: PostHeaderProps) {
  // Check if we're in post creation mode or display mode
  const isPostCreator = !!currentUser && !post;
  
  // For post display mode
  const user_id = post?.user_id;
  const username = post?.profiles?.username || "";
  const avatarUrl = post?.profiles?.avatar_url;
  const timeAgo = post?.created_at ? formatDistanceToNow(new Date(post.created_at), { 
    addSuffix: true,
    locale: es 
  }) : '';

  // For post creator mode
  const creatorUsername = currentUser?.username || '';
  const creatorAvatarUrl = currentUser?.avatar_url;
  
  return (
    <div className="flex flex-col w-full space-y-3">
      <div className="flex items-start justify-between mb-3 relative">
        <div className="flex items-center gap-2">
          {isPostCreator ? (
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={creatorAvatarUrl || ""} alt={creatorUsername} />
              <AvatarFallback>{creatorUsername.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <Link to={`/profile/${user_id}`}>
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={avatarUrl || ""} alt={username} />
                <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
          )}
          
          <div>
            {isPostCreator ? (
              <span className="font-medium">{creatorUsername}</span>
            ) : (
              <Link to={`/profile/${user_id}`} className="font-medium hover:underline">
                {username}
              </Link>
            )}
            
            {!isPostCreator && (
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            )}
          </div>
        </div>

        {post && (
          <PostOptionsMenu 
            postId={post.id} 
            postUserId={user_id} 
            isHidden={isHidden} 
          />
        )}
      </div>
      
      {/* Textarea for post creation */}
      {isPostCreator && (
        <div className="relative w-full">
          <Textarea
            ref={textareaRef}
            placeholder="¿Qué estás pensando?"
            className="w-full min-h-20 resize-none bg-background border-none focus-visible:ring-0 p-0"
            value={content}
            onChange={handleTextAreaChange}
            onKeyDown={handleKeyDown}
          />
          
          {mentionListVisible && mentionUsers && mentionPosition && (
            <MentionSuggestions
              users={mentionUsers}
              isVisible={mentionListVisible}
              position={mentionPosition}
              selectedIndex={mentionIndex || 0}
              onSelectUser={handleSelectMention!}
              onSetIndex={setMentionIndex!}
            />
          )}
        </div>
      )}
    </div>
  );
}
