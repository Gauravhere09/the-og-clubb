
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationIcon } from "./NotificationIcon";
import { NotificationType } from "@/types/notifications";
import { formatDate } from "./utils/date-formatter";
import { NotificationContent } from "./NotificationContent";
import { NotificationPreview } from "./NotificationPreview";
import { CompactFriendActions } from "./CompactFriendActions";
import { NotificationMenu } from "./NotificationMenu";

interface NotificationItemProps {
  notification: {
    id: string;
    type: NotificationType;
    sender: {
      id: string;
      username: string;
      avatar_url: string | null;
      full_name?: string;
    };
    created_at: string;
    message?: string;
    post_id?: string;
    comment_id?: string;
    read: boolean;
    post_content?: string;
    post_media?: string | null;
    comment_content?: string;
  };
  onHandleFriendRequest?: (notificationId: string, senderId: string, accept: boolean) => void;
  onClick?: () => void;
  onMarkAsRead?: () => void;
  compact?: boolean;
}

export const NotificationItem = ({ 
  notification, 
  onHandleFriendRequest, 
  onClick, 
  onMarkAsRead,
  compact = false 
}: NotificationItemProps) => {
  const navigate = useNavigate();

  // Función para obtener el nombre a mostrar (nombre completo o username)
  const getSenderDisplayName = () => {
    return notification.sender.full_name || notification.sender.username;
  };

  const handleClick = () => {
    if (notification.type === 'friend_request') {
      return; // No navegar en solicitudes de amistad
    }
    
    if (onClick) {
      onClick();
    } else if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
      
      if (onMarkAsRead) {
        onMarkAsRead();
      }
    }
  };

  const isClickable = notification.post_id || notification.type === 'friend_request';
  const formattedDate = formatDate(notification.created_at);

  return (
    <div 
      className={`flex items-start gap-4 hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
        isClickable ? 'cursor-pointer' : ''
      } ${!notification.read ? 'bg-primary/5' : ''} ${
        compact ? 'p-3' : 'p-4'
      }`}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="relative">
        <Avatar className={compact ? "h-10 w-10" : ""}>
          <AvatarImage src={notification.sender.avatar_url || undefined} />
          <AvatarFallback>{notification.sender.username[0]}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-1 border-2 border-background">
          <NotificationIcon type={notification.type} />
        </div>
      </div>
      
      <div className={`flex-1 ${compact ? 'pr-8' : ''}`}>
        <div className={compact ? 'text-sm' : ''}>
          <NotificationContent 
            type={notification.type}
            senderName={getSenderDisplayName()}
            message={notification.message}
            notificationId={notification.id}
            senderId={notification.sender.id}
            onHandleFriendRequest={onHandleFriendRequest}
            compact={compact}
          />
        </div>
        <p className={`text-muted-foreground ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>
          {formattedDate}
        </p>
        
        {/* Mostrar vista previa de la publicación o comentario */}
        {!compact && notification.type !== 'friend_request' && (
          <NotificationPreview
            type={notification.type}
            postContent={notification.post_content}
            postMedia={notification.post_media}
            commentContent={notification.comment_content}
          />
        )}
        
        {compact && notification.type === 'friend_request' && onHandleFriendRequest && (
          <CompactFriendActions
            notificationId={notification.id}
            senderId={notification.sender.id}
            onHandleFriendRequest={onHandleFriendRequest}
          />
        )}
      </div>
      
      {!compact && (
        <div className="flex items-center gap-1">
          <NotificationIcon type={notification.type} />
          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-primary ml-1"></span>
          )}
          {onMarkAsRead && (
            <NotificationMenu
              isRead={notification.read}
              onMarkAsRead={onMarkAsRead}
              compact={false}
            />
          )}
        </div>
      )}
      
      {compact && onMarkAsRead && (
        <div className="absolute right-2 top-3">
          <NotificationMenu
            isRead={notification.read}
            onMarkAsRead={onMarkAsRead}
            compact={true}
          />
        </div>
      )}
    </div>
  );
};
