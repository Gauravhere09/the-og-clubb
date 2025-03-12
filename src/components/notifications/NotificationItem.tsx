
import { useNavigate } from "react-router-dom";
import { NotificationType } from "@/types/notifications";
import { formatDate } from "./utils/date-formatter";
import { NotificationContent } from "./NotificationContent";
import { NotificationPreview } from "./NotificationPreview";
import { CompactFriendActions } from "./CompactFriendActions";
import { AvatarWithIcon } from "./AvatarWithIcon";
import { NotificationReadIndicator } from "./NotificationReadIndicator";

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

  // Get the name to display (full name or username)
  const getSenderDisplayName = () => {
    return notification.sender.full_name || notification.sender.username;
  };

  const handleClick = () => {
    if (notification.type === 'friend_request') {
      return; // No navigation for friend requests
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
      <AvatarWithIcon
        avatarUrl={notification.sender.avatar_url}
        username={notification.sender.username}
        notificationType={notification.type}
        compact={compact}
      />
      
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
        
        {/* Preview of post or comment */}
        {!compact && notification.type !== 'friend_request' && (
          <NotificationPreview
            type={notification.type}
            postContent={notification.post_content}
            postMedia={notification.post_media}
            commentContent={notification.comment_content}
          />
        )}
        
        {/* Compact friend request actions */}
        {compact && notification.type === 'friend_request' && onHandleFriendRequest && (
          <CompactFriendActions
            notificationId={notification.id}
            senderId={notification.sender.id}
            onHandleFriendRequest={onHandleFriendRequest}
          />
        )}
      </div>
      
      {/* Read indicator and menu */}
      <NotificationReadIndicator
        type={notification.type}
        isRead={notification.read}
        onMarkAsRead={onMarkAsRead}
        compact={compact}
      />
    </div>
  );
};
