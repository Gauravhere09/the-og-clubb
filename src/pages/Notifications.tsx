
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const notifications = [
  {
    id: 1,
    type: "like",
    user: "María López",
    avatar: "/placeholder.svg",
    content: "le gustó tu publicación",
    time: "Hace 5 minutos",
  },
  {
    id: 2,
    type: "comment",
    user: "Carlos Ruiz",
    avatar: "/placeholder.svg",
    content: "comentó en tu publicación",
    time: "Hace 15 minutos",
  },
  {
    id: 3,
    type: "follow",
    user: "Ana García",
    avatar: "/placeholder.svg",
    content: "comenzó a seguirte",
    time: "Hace 1 hora",
  },
];

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "comment":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "follow":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    default:
      return null;
  }
};

const Notifications = () => {
  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
        <h1 className="text-2xl font-semibold mb-6">Notificaciones</h1>
        <Card>
          <ScrollArea className="h-[calc(100vh-200px)]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors border-b last:border-b-0"
              >
                <Avatar>
                  <AvatarImage src={notification.avatar} />
                  <AvatarFallback>{notification.user[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p>
                    <span className="font-medium">{notification.user}</span>{" "}
                    {notification.content}
                  </p>
                  <p className="text-sm text-muted-foreground">{notification.time}</p>
                </div>
                <NotificationIcon type={notification.type} />
              </div>
            ))}
          </ScrollArea>
        </Card>
      </main>
    </div>
  );
};

export default Notifications;
