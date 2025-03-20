
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserProfileProps {
  username: string;
  avatarUrl: string | null;
  userId: string | null;
  onClose: () => void;
}

export function UserProfile({ username, avatarUrl, userId, onClose }: UserProfileProps) {
  const navigate = useNavigate();
  
  const handleProfileClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
      onClose();
    }
  };

  return (
    <div className="bg-white dark:bg-card m-4 rounded-lg shadow">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-card/80"
        onClick={handleProfileClick}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>
              {username ? username[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold">{username}</h3>
        </div>
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      </Button>
    </div>
  );
}
