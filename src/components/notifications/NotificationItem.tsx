
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X, Bell } from "lucide-react";
import { NotificationIcon } from "./NotificationIcon";
import { NotificationType } from "@/types/notifications";
import { motion } from "framer-motion";
import { useState } from "react";

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
  onMarkAsRead?: (notificationId: string) => void;
}

export const NotificationItem = ({ 
  notification, 
  onHandleFriendRequest, 
  onClick,
  onMarkAsRead 
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
    } else if (hours > 0) {
      return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else if (minutes > 0) {
      return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else {
      return 'hace unos segundos';
    }
  };

  const handleClick = () => {
    if (notification.type === 'friend_request') {
      return; // No navegar en solicitudes de amistad
    }
    
    if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    }

    if (onClick) onClick();
    
    // Marcar como leído al hacer clic
    if (onMarkAsRead && !notification.read) {
      onMarkAsRead(notification.id);
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
          <div className="flex flex-col gap-2">
            <span>
              <span className="font-medium">{notification.sender.username}</span> te envió una solicitud de amistad
            </span>
            {onHandleFriendRequest && (
              <div className="flex gap-2 mt-1">
                <Button
                  size="sm"
                  variant="default"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={() => onHandleFriendRequest(notification.id, notification.sender.id, true)}
                >
                  <Check className="h-4 w-4 mr-1" /> Aceptar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-rose-500 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => onHandleFriendRequest(notification.id, notification.sender.id, false)}
                >
                  <X className="h-4 w-4 mr-1" /> Rechazar
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

  return (
    <motion.div 
      className={`p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors border-b last:border-b-0 relative ${
        isClickable ? 'cursor-pointer' : ''
      } ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
      onClick={isClickable ? handleClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      {!notification.read && (
        <motion.div 
          className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"
          layoutId={`unread-${notification.id}`}
        />
      )}
      <Avatar className="mt-1">
        <AvatarImage src={notification.sender.avatar_url || undefined} />
        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
          {notification.sender.username[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {renderContent()}
            <p className="text-sm text-muted-foreground mt-1">
              {timeAgo(notification.created_at)}
            </p>
          </div>
          <NotificationIcon type={notification.type} />
        </div>
        
        {notification.type === 'post_comment' && notification.post_id && isExpanded && (
          <motion.div 
            className="mt-3 p-3 bg-muted/50 rounded-md text-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="font-medium mb-1">Contenido del comentario:</p>
            <p className="text-muted-foreground">{notification.message || "Ver comentario completo..."}</p>
            <Button 
              variant="link" 
              size="sm" 
              className="mt-1 p-0 h-auto text-primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${notification.post_id}`);
              }}
            >
              Ver publicación
            </Button>
          </motion.div>
        )}
        
        {(notification.type === 'post_comment' || notification.type === 'post_like' || notification.type === 'new_post') && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-6 px-2 text-xs text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'Ver menos' : 'Ver más'}
          </Button>
        )}
      </div>
      
      {isHovered && !notification.read && onMarkAsRead && notification.type !== 'friend_request' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-2 top-2"
        >
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            <Check className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
