
import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useFriends } from "@/hooks/use-friends";
import { supabase } from "@/integrations/supabase/client";
import { NotificationDropdownHeader } from "./NotificationDropdownHeader";
import { NotificationGroups } from "./NotificationGroups";
import { NotificationsSuggestions } from "./NotificationsSuggestions";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { notifications, handleFriendRequest, markAsRead, clearAllNotifications } = useNotifications();
  const [hasUnread, setHasUnread] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { suggestions } = useFriends(currentUserId);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Group notifications by date
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
        <NotificationDropdownHeader 
          hasUnread={hasUnread} 
          onMarkAllAsRead={handleMarkAllAsRead} 
        />
        
        <ScrollArea className="max-h-[calc(80vh-60px)]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            <>
              <NotificationGroups
                groupedNotifications={groupedNotifications}
                handleFriendRequest={handleFriendRequest}
                markAsRead={markAsRead}
                setOpen={setOpen}
              />
              
              {/* Sección de Sugerencias para ti */}
              {showSuggestions && (
                <NotificationsSuggestions
                  suggestions={suggestions}
                  onDismissSuggestion={handleDismissSuggestion}
                  setOpen={setOpen}
                />
              )}
            </>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
