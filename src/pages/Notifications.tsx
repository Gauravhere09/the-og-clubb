
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Bell, Check, FilterX, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const Notifications = () => {
  const { 
    notifications, 
    handleFriendRequest, 
    markAsRead, 
    markAllAsRead, 
    isLoading 
  } = useNotifications();
  const [activeTab, setActiveTab] = useState("all");
  
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);
  
  const displayNotifications = activeTab === "all" 
    ? notifications 
    : activeTab === "unread" 
      ? unreadNotifications 
      : readNotifications;

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Notificaciones</h1>
          {unreadNotifications.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              className="text-sm h-9"
            >
              <Check className="mr-1 h-4 w-4" /> Marcar todas como leídas
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all" className="relative">
                Todas
                {notifications.length > 0 && (
                  <span className="ml-1 text-xs bg-muted rounded-full px-1.5">
                    {notifications.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="relative">
                No leídas
                {unreadNotifications.length > 0 && (
                  <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5">
                    {unreadNotifications.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="read">Leídas</TabsTrigger>
            </TabsList>
          </div>

          <Card className="overflow-hidden">
            <TabsContent value="all" className="m-0">
              <NotificationsContent 
                notifications={notifications} 
                handleFriendRequest={handleFriendRequest} 
                markAsRead={markAsRead}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="unread" className="m-0">
              <NotificationsContent 
                notifications={unreadNotifications} 
                handleFriendRequest={handleFriendRequest} 
                markAsRead={markAsRead}
                isLoading={isLoading}
                emptyMessage="No tienes notificaciones sin leer"
              />
            </TabsContent>
            
            <TabsContent value="read" className="m-0">
              <NotificationsContent 
                notifications={readNotifications} 
                handleFriendRequest={handleFriendRequest} 
                markAsRead={markAsRead}
                isLoading={isLoading}
                emptyMessage="No tienes notificaciones leídas"
              />
            </TabsContent>
          </Card>
        </Tabs>
      </main>
    </div>
  );
};

interface NotificationsContentProps {
  notifications: any[];
  handleFriendRequest: (notificationId: string, senderId: string, accept: boolean) => void;
  markAsRead: (notificationId: string) => void;
  isLoading: boolean;
  emptyMessage?: string;
}

const NotificationsContent = ({ 
  notifications, 
  handleFriendRequest, 
  markAsRead,
  isLoading,
  emptyMessage = "No tienes notificaciones"
}: NotificationsContentProps) => {
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              {i % 2 === 0 && <Skeleton className="h-8 w-32 mt-2" />}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted/50 p-4 rounded-full mb-4">
          <FilterX className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[calc(100vh-240px)]">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            layout
          >
            <NotificationItem
              key={notification.id}
              notification={notification}
              onHandleFriendRequest={handleFriendRequest}
              onMarkAsRead={markAsRead}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </ScrollArea>
  );
};

export default Notifications;
