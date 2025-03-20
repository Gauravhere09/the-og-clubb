
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

interface UserStoryButtonProps {
  username: string;
  avatarUrl: string | null;
  onClick: () => void;
  hasUnviewed: boolean;
}

export function UserStoryButton({ 
  username, 
  avatarUrl,
  onClick,
  hasUnviewed
}: UserStoryButtonProps) {
  return (
    <div 
      className="flex flex-col items-center gap-1 cursor-pointer min-w-[80px] mx-1"
      onClick={onClick}
    >
      <div className={`relative w-16 h-16 rounded-full ${hasUnviewed ? 'bg-primary p-[2px]' : ''} flex items-center justify-center`}>
        <Avatar className="w-full h-full border-2 border-background">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback>{username[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
      </div>
      <span className="text-xs font-medium text-center">
        {username}
      </span>
    </div>
  );
}
