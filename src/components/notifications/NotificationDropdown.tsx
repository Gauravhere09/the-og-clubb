
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { NotificationDropdownHeader } from "./NotificationDropdownHeader";
import { NotificationGroups } from "./NotificationGroups";
import { NotificationsSuggestions } from "./NotificationsSuggestions";
import { useNotificationDropdown } from "@/hooks/use-notification-dropdown";

export function NotificationDropdown() {
  const {
    open,
    setOpen,
    hasUnread,
    notifications,
    groupedNotifications,
    handleFriendRequest,
    markAsRead,
    suggestions,
    showSuggestions,
    toggleSuggestions,
    handleMarkAllAsRead,
    handleDismissSuggestion
  } = useNotificationDropdown();

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
                  onToggleVisibility={toggleSuggestions}
                  showToggle={true}
                />
              )}
            </>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
