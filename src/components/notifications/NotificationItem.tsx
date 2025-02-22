
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { NotificationIcon } from "./NotificationIcon";
import { NotificationType } from "@/types/notifications";

interface NotificationItemProps {
  notification: {
    id: string;
    type: NotificationType;
    sender: {
      id: string;
      username: string;
      avatar_url: string | null;
    };
    created_at: string;
    message?: string;
    post_id?: string;
  };
  onHandleFriendRequest?: (notificationId: string, senderId: string, accept: boolean) => void;
}

export const NotificationItem = ({ notification, onHandleFriendRequest }: NotificationItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    }
  };

  const renderContent = () => {
    if (notification.message) {
      return (
        <span>
          <span className="font-medium">{notification.sender.username}</span> {notification.message}
        </span>
      );
    }

    switch (notification.type) {
      case 'friend_request':
        return (
          <div className="flex items-center gap-2">
            <span>
              <span className="font-medium">{notification.sender.username}</span> te envió una solicitud de amistad
            </span>
            {onHandleFriendRequest && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onHandleFriendRequest(notification.id, notification.sender.id, true)}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onHandleFriendRequest(notification.id, notification.sender.id, false)}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
          </div>
        );
      case 'like':
        return (
          <span>
            <span className="font-medium">{notification.sender.username}</span> le dio me gusta a tu publicación
          </span>
        );
      case 'post_like':
        return (
          <span>
            <span className="font-medium">{notification.sender.username}</span> reaccionó a tu publicación
          </span>
        );
      case 'message':
        return (
          <span>
            <span className="font-medium">{notification.sender.username}</span> te envió un mensaje
          </span>
        );
      case 'new_post':
        return (
          <span>
            <span className="font-medium">{notification.sender.username}</span> ha realizado una nueva publicación
          </span>
        );
      case 'friend_accepted':
        return (
          <span>
            <span className="font-medium">{notification.sender.username}</span> aceptó tu solicitud de amistad
          </span>
        );
      default:
        return null;
    }
  };

  const isClickable = notification.post_id && notification.type !== 'friend_request';

  return (
    <div 
      className={`p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
        isClickable ? 'cursor-pointer' : ''
      }`}
      onClick={isClickable ? handleClick : undefined}
    >
      <Avatar>
        <AvatarImage src={notification.sender.avatar_url || undefined} />
        <AvatarFallback>{notification.sender.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        {renderContent()}
        <p className="text-sm text-muted-foreground">
          {new Date(notification.created_at).toLocaleString()}
        </p>
      </div>
      <NotificationIcon type={notification.type} />
    </div>
  );
};
