
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
    <div className="p-4 border-b border-border last:border-0">
      <div className="flex items-start space-y-4 md:space-y-0">
        <Link to={`/profile/${sender.id}`} className="flex-shrink-0">
          <Avatar className="h-16 w-16">
            <AvatarImage src={sender.avatar_url || undefined} />
            <AvatarFallback>{sender.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="ml-3 flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
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
            
            <div className="text-sm text-muted-foreground mt-1 md:mt-0">
              {timeAgo}
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button 
              size={isMobile ? "sm" : "default"}
              className="flex-1 bg-primary text-white"
              onClick={() => onAccept(id)}
            >
              Confirmar
            </Button>
            <Button 
              size={isMobile ? "sm" : "default"}
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
