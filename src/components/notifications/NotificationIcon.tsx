
import { Heart, MessageCircle, UserPlus, ThumbsUp } from "lucide-react";
import type { NotificationType } from "@/types/notifications";

export const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case "friend_request":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case "message":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "like":
    case "post_like":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "new_post":
      return <MessageCircle className="h-4 w-4 text-purple-500" />;
    case "friend_accepted":
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    default:
      return null;
  }
};
