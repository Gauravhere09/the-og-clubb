
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "@/hooks/use-notifications";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { notifications, handleFriendRequest } = useNotifications();
  const [hasUnread, setHasUnread] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasUnreadNotifications = notifications.some((notification) => !notification.read);
    setHasUnread(hasUnreadNotifications);
  }, [notifications]);

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
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <ScrollArea className="h-80">
          <div className="p-4 border-b">
            <h4 className="font-semibold">Notificaciones</h4>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onHandleFriendRequest={handleFriendRequest}
                onClick={() => {
                  if (notification.post_id) {
                    navigate(`/post/${notification.post_id}`);
                    setOpen(false);
                  }
                }}
              />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
