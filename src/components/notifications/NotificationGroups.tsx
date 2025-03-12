
import { NotificationItem } from "./NotificationItem";
import { NotificationWithSender } from "@/types/notifications";
import { useNavigate } from "react-router-dom";
import { NotificationGroupHeader } from "./NotificationGroupHeader";

interface NotificationGroupsProps {
  groupedNotifications: {
    today: NotificationWithSender[];
    yesterday: NotificationWithSender[];
    older: NotificationWithSender[];
  };
  handleFriendRequest: (notificationId: string, senderId: string, accept: boolean) => void;
  markAsRead: (notificationIds?: string[]) => void;
  setOpen: (open: boolean) => void;
}

export function NotificationGroups({ 
  groupedNotifications, 
  handleFriendRequest, 
  markAsRead, 
  setOpen 
}: NotificationGroupsProps) {
  const navigate = useNavigate();

  const handleNotificationClick = (notification: NotificationWithSender) => {
    if (notification.type === 'friend_request') {
      navigate(`/profile/${notification.sender.id}`);
    } else if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    }
    setOpen(false);
    if (!notification.read) {
      markAsRead([notification.id]);
    }
  };

  return (
    <>
      {groupedNotifications.today.length > 0 && (
        <>
          <NotificationGroupHeader title="Hoy" />
          {groupedNotifications.today.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onHandleFriendRequest={handleFriendRequest}
              onClick={() => handleNotificationClick(notification)}
              onMarkAsRead={() => markAsRead([notification.id])}
              compact={true}
            />
          ))}
        </>
      )}
      
      {groupedNotifications.yesterday.length > 0 && (
        <>
          <NotificationGroupHeader title="Ayer" />
          {groupedNotifications.yesterday.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onHandleFriendRequest={handleFriendRequest}
              onClick={() => handleNotificationClick(notification)}
              onMarkAsRead={() => markAsRead([notification.id])}
              compact={true}
            />
          ))}
        </>
      )}
      
      {groupedNotifications.older.length > 0 && (
        <>
          <NotificationGroupHeader title="Anteriores" />
          {groupedNotifications.older.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onHandleFriendRequest={handleFriendRequest}
              onClick={() => handleNotificationClick(notification)}
              onMarkAsRead={() => markAsRead([notification.id])}
              compact={true}
            />
          ))}
        </>
      )}
    </>
  );
}
