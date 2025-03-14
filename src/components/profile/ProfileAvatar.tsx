
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Maximize } from "lucide-react";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  username: string | null;
  isOwner: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string>;
  onOpenFullscreen: () => void;
}

export function ProfileAvatar({ 
  avatarUrl, 
  username, 
  isOwner, 
  onUpload, 
  onOpenFullscreen 
}: ProfileAvatarProps) {
  return (
    <div className="relative">
      <Avatar 
        className="h-32 w-32 border-4 border-background cursor-pointer"
        onClick={() => avatarUrl && onOpenFullscreen()}
      >
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback>
          {username?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      {avatarUrl && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-0 right-0 bg-black/50 hover:bg-black/70 text-white"
          onClick={onOpenFullscreen}
        >
          <Maximize className="h-4 w-4" />
        </Button>
      )}
      {isOwner && (
        <div className="absolute -right-2 -bottom-2">
          <input
            type="file"
            id="avatar-upload"
            className="hidden"
            accept="image/*"
            onChange={onUpload}
          />
          <label htmlFor="avatar-upload">
            <Button
              size="icon"
              variant="secondary"
              className="cursor-pointer"
              asChild
            >
              <span>
                <Camera className="h-4 w-4" />
              </span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
}
