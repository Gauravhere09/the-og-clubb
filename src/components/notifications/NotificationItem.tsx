
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X, MoreVertical } from "lucide-react";
import { NotificationIcon } from "./NotificationIcon";
import { NotificationType } from "@/types/notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    comment_id?: string;
    read: boolean;
  };
  onHandleFriendRequest?: (notificationId: string, senderId: string, accept: boolean) => void;
  onClick?: () => void;
  onMarkAsRead?: () => void;
}

export const NotificationItem = ({ notification, onHandleFriendRequest, onClick, onMarkAsRead }: NotificationItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (notification.type === 'friend_request') {
      return; // No navegar en solicitudes de amistad
    }
    
    if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    }
    
    if (onMarkAsRead) {
      onMarkAsRead();
    }
    
    if (onClick) {
      onClick();
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
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              <span className="font-medium">{notification.sender.username}</span> te envió una solicitud de amistad
            </span>
            {onHandleFriendRequest && (
              <div className="flex items-center ml-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHandleFriendRequest(notification.id, notification.sender.id, true);
                  }}
                  className="h-8 px-2"
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHandleFriendRequest(notification.id, notification.sender.id, false);
                  }}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
        );
      case 'post_like':
        return (
          <span>
            <span className="font-medium">{notification.sender.username}</span> ha reaccionado a tu publicación
          </span>
        );
      case 'post_comment':
        return (
          <span>
            <span className="font-medium">{notification.sender.username}</span> ha comentado en tu publicación
          </span>
        );
      case 'comment_reply':
        return (
          <span>
            <span className="font-medium">{notification.sender.username}</span> ha respondido a tu comentario
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
  const formattedDate = formatDate(notification.created_at);

  return (
    <div 
      className={`p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
        isClickable ? 'cursor-pointer' : ''
      } ${!notification.read ? 'bg-primary/5' : ''}`}
      onClick={isClickable ? handleClick : undefined}
    >
      <Avatar>
        <AvatarImage src={notification.sender.avatar_url || undefined} />
        <AvatarFallback>{notification.sender.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        {renderContent()}
        <p className="text-sm text-muted-foreground">
          {formattedDate}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <NotificationIcon type={notification.type} />
        {!notification.read && (
          <span className="h-2 w-2 rounded-full bg-primary ml-1"></span>
        )}
        {onMarkAsRead && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead();
              }}>
                {notification.read ? 'Marcar como no leída' : 'Marcar como leída'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

// Función para formatear la fecha de forma amigable
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;

  return date.toLocaleDateString();
}
