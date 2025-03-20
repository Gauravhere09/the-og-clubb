
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Post } from "@/types/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostOptionsMenu } from "./actions/PostOptionsMenu";

interface PostHeaderProps {
  post: Post;
  onDelete?: () => void;
  isAuthor?: boolean;
  isHidden?: boolean;
  content?: string;
  // Add new props for PostCreator component
  currentUser?: { id: string; avatar_url: string | null; username: string | null };
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  mentionUsers?: any[];
  mentionListVisible?: boolean;
  mentionPosition?: any;
  mentionIndex?: number;
  handleTextAreaChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSelectMention?: (user: any) => void;
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
  const { created_at, user_id } = post;
  const username = post.profiles?.username || "";
  const avatarUrl = post.profiles?.avatar_url;
  
  const timeAgo = formatDistanceToNow(new Date(created_at), { 
    addSuffix: true,
    locale: es 
  });

  return (
    <div className="flex items-start justify-between mb-3 relative">
      <div className="flex items-center gap-2">
        <Link to={`/profile/${user_id}`}>
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={avatarUrl || ""} alt={username} />
            <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link to={`/profile/${user_id}`} className="font-medium hover:underline">
            {username}
          </Link>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>

      <PostOptionsMenu 
        postId={post.id} 
        postUserId={user_id} 
        isHidden={isHidden} 
      />
    </div>
  );
}
