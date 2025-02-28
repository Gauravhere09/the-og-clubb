
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNotifications } from "@/hooks/use-notifications";

const Notifications = () => {
  const { notifications, handleFriendRequest } = useNotifications();

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
        <h1 className="text-2xl font-semibold mb-6">Notificaciones</h1>
        <Card>
          <ScrollArea className="h-[calc(100vh-200px)]">
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
                />
              ))
            )}
          </ScrollArea>
        </Card>
      </main>
    </div>
  );
};

export default Notifications;
