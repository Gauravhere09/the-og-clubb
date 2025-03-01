
import type { NotificationType } from "@/types/notifications";

export const formatNotificationMessage = (type: NotificationType, username: string) => {
  switch (type) {
    case 'friend_request':
      return `${username} te ha enviado una solicitud de amistad`;
    case 'post_comment':
      return `${username} ha comentado en tu publicación`;
    case 'comment_reply':
      return `${username} ha respondido a tu comentario`;
    case 'post_like':
      return `A ${username} le ha gustado tu publicación`;
    case 'new_post':
      return `${username} ha publicado algo nuevo`;
    case 'friend_accepted':
      return `${username} ha aceptado tu solicitud de amistad`;
    default:
      return `Nueva notificación de ${username}`;
  }
};
