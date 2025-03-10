
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell, Check, MoreHorizontal, X, User, UserPlus, Sparkles } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "@/hooks/use-notifications";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useFriends } from "@/hooks/use-friends";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/FollowButton";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { notifications, handleFriendRequest, markAsRead, clearAllNotifications } = useNotifications();
  const [hasUnread, setHasUnread] = useState(false);
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { suggestions } = useFriends(currentUserId);
  const [showSuggestions, setShowSuggestions] = useState(true);

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
    
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    
    getCurrentUser();
  }, [notifications]);

  const handleMarkAllAsRead = () => {
    markAsRead();
    setHasUnread(false);
  };

  const handleDismissSuggestion = (userId: string) => {
    // Esta función podría implementarse más adelante para persistir
    // las sugerencias descartadas en la base de datos
    console.log(`Dismissed suggestion for user ${userId}`);
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
              
              {/* Sección de Sugerencias para ti */}
              {showSuggestions && suggestions.length > 0 && (
                <>
                  <div className="p-2 bg-muted/50 text-sm font-medium text-muted-foreground flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <span>Sugerencias para ti</span>
                    </div>
                  </div>
                  
                  {suggestions.slice(0, 5).map((suggestion) => (
                    <div key={suggestion.id} className="p-3 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Link to={`/profile/${suggestion.id}`} onClick={() => setOpen(false)}>
                          <Avatar>
                            <AvatarImage src={suggestion.avatar_url || undefined} />
                            <AvatarFallback>{suggestion.username[0]}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div>
                          <Link 
                            to={`/profile/${suggestion.id}`}
                            className="font-medium hover:underline"
                            onClick={() => setOpen(false)}
                          >
                            {suggestion.username}
                          </Link>
                          {suggestion.mutual_friends_count > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {suggestion.mutual_friends_count} amigos en común
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <FollowButton targetUserId={suggestion.id} size="sm" />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleDismissSuggestion(suggestion.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="p-2 text-center">
                    <Link 
                      to="/friends" 
                      className="text-sm text-blue-500 hover:underline"
                      onClick={() => setOpen(false)}
                    >
                      Ver todas las sugerencias
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
