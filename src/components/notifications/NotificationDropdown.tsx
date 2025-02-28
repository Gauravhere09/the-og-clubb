
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell, Check, MoreVertical, BellRing } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "@/hooks/use-notifications";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    handleFriendRequest, 
    markAsRead, 
    markAllAsRead,
    loadNotifications 
  } = useNotifications();
  const navigate = useNavigate();
  const bellRef = useRef<HTMLButtonElement>(null);

  // Efecto para hacer vibrar la campana cuando hay notificaciones sin leer
  useEffect(() => {
    if (unreadCount > 0 && bellRef.current) {
      const interval = setInterval(() => {
        bellRef.current?.classList.add('animate-wiggle');
        setTimeout(() => {
          bellRef.current?.classList.remove('animate-wiggle');
        }, 1000);
      }, 10000); // Repetir cada 10 segundos
      
      return () => clearInterval(interval);
    }
  }, [unreadCount]);

  // Efecto para recargar notificaciones cuando se abre el popover
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={bellRef}
          variant="ghost"
          size="icon"
          className="relative rounded-full"
        >
          {unreadCount > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 flex items-center justify-center"
              >
                <span className="relative flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-[10px] font-medium items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10">
          <h4 className="font-semibold">Notificaciones</h4>
          <div className="flex items-center">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-2 mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
              >
                <Check className="h-3 w-3 mr-1" /> Marcar todas como leídas
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/notifications')}>
                  Ver todas las notificaciones
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => markAllAsRead()}>
                  Marcar todas como leídas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <ScrollArea className="flex-1 max-h-[calc(80vh-60px)]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground flex flex-col items-center">
              <Bell className="h-10 w-10 mb-2 text-muted-foreground/50" />
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  layout
                >
                  <NotificationItem
                    notification={notification}
                    onHandleFriendRequest={handleFriendRequest}
                    onMarkAsRead={markAsRead}
                    onClick={() => {
                      if (notification.post_id) {
                        navigate(`/post/${notification.post_id}`);
                        setOpen(false);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t sticky bottom-0 bg-background">
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={() => {
              navigate('/notifications');
              setOpen(false);
            }}
          >
            Ver todas las notificaciones
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
