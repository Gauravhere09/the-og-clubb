
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatTimeAgo } from "@/lib/utils";

interface FriendRequestItemProps {
  id: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  created_at: string;
  mutualFriendsCount?: number;
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
}

export function FriendRequestItem({ 
  id, 
  sender, 
  created_at, 
  mutualFriendsCount = 0,
  onAccept, 
  onReject 
}: FriendRequestItemProps) {
  const isMobile = useIsMobile();
  const timeAgo = formatTimeAgo(created_at);
  
  return (
    <div className="py-4 border-b border-border last:border-b-0">
      <div className="flex items-start gap-3">
        <Link to={`/profile/${sender.id}`} className="flex-shrink-0">
          <Avatar className="h-16 w-16">
            <AvatarImage src={sender.avatar_url || undefined} />
            <AvatarFallback>{sender.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <Link to={`/profile/${sender.id}`} className="font-medium hover:underline text-lg">
                {sender.username}
              </Link>
              
              {mutualFriendsCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {mutualFriendsCount} {mutualFriendsCount === 1 ? 'amigo' : 'amigos'} en común
                </p>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground mt-1">
              {timeAgo}
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button 
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              onClick={() => onAccept(id)}
            >
              Confirmar
            </Button>
            <Button 
              variant="secondary"
              className="flex-1"
              onClick={() => onReject(id)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
