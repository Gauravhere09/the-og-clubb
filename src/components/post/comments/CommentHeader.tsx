
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface CommentHeaderProps {
  userId: string;
  username?: string;
  avatarUrl?: string;
}

export function CommentHeader({ userId, username, avatarUrl }: CommentHeaderProps) {
  return (
    <Link to={`/profile/${userId}`}>
      <Avatar className="h-6 w-6 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{username?.[0]}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
