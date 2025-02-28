
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X, MoreVertical, MoreHorizontal } from "lucide-react";
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
  compact?: boolean; // Nuevo prop para mostrar versión compacta
}

export const NotificationItem = ({ 
  notification, 
  onHandleFriendRequest, 
  onClick, 
  onMarkAsRead,
  compact = false 
}: NotificationItemProps) => {
  const navigate = useNavigate();

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
              Tienes una sugerencia de amistad nueva: <span className="font-medium">{notification.sender.username}</span>
            </span>
            {onHandleFriendRequest && !compact && (
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
          {renderContent()}
        </div>
        <p className={`text-muted-foreground ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>
          {formattedDate}
        </p>
        
        {compact && notification.type === 'friend_request' && onHandleFriendRequest && (
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                onHandleFriendRequest(notification.id, notification.sender.id, true);
              }}
              className="h-7 px-3 text-xs w-full"
            >
              Confirmar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onHandleFriendRequest(notification.id, notification.sender.id, false);
              }}
              className="h-7 px-3 text-xs w-full"
            >
              Eliminar
            </Button>
          </div>
        )}
      </div>
      
      {!compact && (
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
      )}
      
      {compact && onMarkAsRead && (
        <div className="absolute right-2 top-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                <MoreHorizontal className="h-4 w-4" />
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
        </div>
      )}
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
  
  // Para versión compacta en estilo Facebook
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ' a las');
}
