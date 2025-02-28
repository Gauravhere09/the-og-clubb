
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell, Check, MoreHorizontal } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "@/hooks/use-notifications";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { notifications, handleFriendRequest, markAsRead, clearAllNotifications } = useNotifications();
  const [hasUnread, setHasUnread] = useState(false);
  const navigate = useNavigate();

  // Agrupar notificaciones por fecha
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = new Date(notification.created_at).toDateString();
    
    let group = "older";
    if (date === today) group = "today";
    else if (date === yesterday) group = "yesterday";
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(notification);
    
    return acc;
  }, { today: [], yesterday: [], older: [] });

  useEffect(() => {
    const hasUnreadNotifications = notifications.some((notification) => !notification.read);
    setHasUnread(hasUnreadNotifications);
  }, [notifications]);

  const handleMarkAllAsRead = () => {
    markAsRead();
    setHasUnread(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
          <h4 className="font-semibold text-lg">Notificaciones</h4>
          <div className="flex gap-2">
            {hasUnread && (
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={handleMarkAllAsRead}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Marcar como leídas</span>
              </Button>
            )}
            <Link to="/notifications">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Ver todas
              </Button>
            </Link>
          </div>
        </div>
        
        <ScrollArea className="max-h-[calc(80vh-60px)]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            <>
              {groupedNotifications.today.length > 0 && (
                <>
                  <div className="p-2 bg-muted/30 text-sm font-medium text-muted-foreground">
                    Hoy
                  </div>
                  {groupedNotifications.today.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onHandleFriendRequest={handleFriendRequest}
                      onClick={() => {
                        if (notification.type === 'friend_request') {
                          navigate(`/profile/${notification.sender.id}`);
                        } else if (notification.post_id) {
                          navigate(`/post/${notification.post_id}`);
                        }
                        setOpen(false);
                        if (!notification.read) {
                          markAsRead([notification.id]);
                        }
                      }}
                      onMarkAsRead={() => markAsRead([notification.id])}
                      compact={true}
                    />
                  ))}
                </>
              )}
              
              {groupedNotifications.yesterday.length > 0 && (
                <>
                  <div className="p-2 bg-muted/30 text-sm font-medium text-muted-foreground">
                    Ayer
                  </div>
                  {groupedNotifications.yesterday.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onHandleFriendRequest={handleFriendRequest}
                      onClick={() => {
                        if (notification.type === 'friend_request') {
                          navigate(`/profile/${notification.sender.id}`);
                        } else if (notification.post_id) {
                          navigate(`/post/${notification.post_id}`);
                        }
                        setOpen(false);
                        if (!notification.read) {
                          markAsRead([notification.id]);
                        }
                      }}
                      onMarkAsRead={() => markAsRead([notification.id])}
                      compact={true}
                    />
                  ))}
                </>
              )}
              
              {groupedNotifications.older.length > 0 && (
                <>
                  <div className="p-2 bg-muted/30 text-sm font-medium text-muted-foreground">
                    Anteriores
                  </div>
                  {groupedNotifications.older.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onHandleFriendRequest={handleFriendRequest}
                      onClick={() => {
                        if (notification.type === 'friend_request') {
                          navigate(`/profile/${notification.sender.id}`);
                        } else if (notification.post_id) {
                          navigate(`/post/${notification.post_id}`);
                        }
                        setOpen(false);
                        if (!notification.read) {
                          markAsRead([notification.id]);
                        }
                      }}
                      onMarkAsRead={() => markAsRead([notification.id])}
                      compact={true}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
