
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
      <div className="flex items-center justify-between p-4">
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
      </div>
      <Separator />
      <Button
        variant="ghost"
        className="w-full justify-start rounded-none py-5 px-4 text-muted-foreground gap-3"
        onClick={handleProfileClick}
      >
        <User className="h-5 w-5 text-muted-foreground" />
        <div className="flex flex-col items-start">
          <span>Ver tu perfil</span>
        </div>
      </Button>
    </div>
  );
}
