
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { NotificationType } from "@/types/notifications";

interface NotificationWithSender {
  id: string;
  type: NotificationType;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name?: string; // Añadimos el campo full_name
  };
  created_at: string;
  message?: string;
  post_id?: string;
  comment_id?: string;
  read: boolean;
  post_content?: string;
  post_media?: string | null;
  comment_content?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationWithSender[]>([]);
  const { toast } = useToast();

  const formatNotificationMessage = (type: NotificationType, username: string) => {
    switch (type) {
      case 'friend_request':
        return `${username} te ha enviado una solicitud de amistad`;
      case 'post_comment':
        return `${username} ha comentado en tu publicación`;
      case 'comment_reply':
        return `${username} ha respondido a tu comentario`;
      case 'post_like':
        return `${username} ha reaccionado a tu publicación`;
      case 'new_post':
        return `${username} ha realizado una nueva publicación`;
      case 'friend_accepted':
        return `${username} ha aceptado tu solicitud de amistad`;
      default:
        return `Nueva notificación de ${username}`;
    }
  };

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // First, check if the table and columns exist to avoid SQL errors
      const { data: tableInfo, error: tableError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error('Error checking notifications table:', tableError);
        return;
      }
      
      // Use a simple query first to fetch base notification data
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          created_at,
          message,
          post_id,
          comment_id,
          read,
          sender_id
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      if (!data || data.length === 0) {
        setNotifications([]);
        return;
      }

      // Get all unique sender IDs
      const senderIds = [...new Set(data.map(item => item.sender_id))];
      
      // Fetch sender profiles in a separate query - ahora incluimos full_name
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, full_name')
        .in('id', senderIds);
        
      if (profilesError) {
        console.error('Error loading sender profiles:', profilesError);
      }
      
      // Get all post IDs from notifications
      const postIds = [...new Set(data.filter(item => item.post_id).map(item => item.post_id!))];
      
      // Fetch post details if there are any post IDs
      let postsData: Record<string, any> = {};
      if (postIds.length > 0) {
        const { data: posts, error: postsError } = await supabase
          .from('posts')
          .select('id, content, media_url')
          .in('id', postIds);
          
        if (!postsError && posts) {
          // Create a map of post IDs to post data
          postsData = posts.reduce((acc, post) => ({
            ...acc,
            [post.id]: post
          }), {});
        }
      }
      
      // Get all comment IDs from notifications
      const commentIds = [...new Set(data.filter(item => item.comment_id).map(item => item.comment_id!))];
      
      // Fetch comment details if there are any comment IDs
      let commentsData: Record<string, any> = {};
      if (commentIds.length > 0) {
        const { data: comments, error: commentsError } = await supabase
          .from('comments')
          .select('id, content')
          .in('id', commentIds);
          
        if (!commentsError && comments) {
          // Create a map of comment IDs to comment data
          commentsData = comments.reduce((acc, comment) => ({
            ...acc,
            [comment.id]: comment
          }), {});
        }
      }
      
      // Create a map of sender IDs to profiles for quick lookup
      const profileMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.id, profile);
        });
      }
      
      // Map notifications with sender info and related content
      const notificationsWithSenders = data.map(notification => {
        const senderProfile = profileMap.get(notification.sender_id) || {
          id: notification.sender_id,
          username: 'Usuario',
          avatar_url: null,
          full_name: null
        };
        
        // Get post data if this notification is related to a post
        let postContent = undefined;
        let postMedia = undefined;
        if (notification.post_id && postsData[notification.post_id]) {
          postContent = postsData[notification.post_id].content;
          postMedia = postsData[notification.post_id].media_url;
        }
        
        // Get comment data if this notification is related to a comment
        let commentContent = undefined;
        if (notification.comment_id && commentsData[notification.comment_id]) {
          commentContent = commentsData[notification.comment_id].content;
        }
        
        return {
          id: notification.id,
          type: notification.type as NotificationType,
          created_at: notification.created_at,
          message: notification.message ?? undefined,
          post_id: notification.post_id ?? undefined,
          comment_id: notification.comment_id ?? undefined,
          read: notification.read,
          sender: {
            id: senderProfile.id,
            username: senderProfile.username,
            avatar_url: senderProfile.avatar_url,
            full_name: senderProfile.full_name || undefined
          },
          post_content: postContent,
          post_media: postMedia,
          comment_content: commentContent
        };
      });
      
      setNotifications(notificationsWithSenders);
    } catch (error) {
      console.error('Error in loadNotifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        async (payload) => {
          // Fetch sender info for the new notification
          const { data: senderData, error: senderError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();
          
          let postContent, postMedia, commentContent;
          
          // Fetch post data if this notification is related to a post
          if (payload.new.post_id) {
            const { data: postData } = await supabase
              .from('posts')
              .select('content, media_url')
              .eq('id', payload.new.post_id)
              .single();
              
            if (postData) {
              postContent = postData.content;
              postMedia = postData.media_url;
            }
          }
          
          // Fetch comment data if this notification is related to a comment
          if (payload.new.comment_id) {
            const { data: commentData } = await supabase
              .from('comments')
              .select('content')
              .eq('id', payload.new.comment_id)
              .single();
              
            if (commentData) {
              commentContent = commentData.content;
            }
          }
          
          if (!senderError && senderData) {
            const newNotification: NotificationWithSender = {
              id: payload.new.id,
              type: payload.new.type as NotificationType,
              created_at: payload.new.created_at,
              message: payload.new.message ?? undefined,
              post_id: payload.new.post_id ?? undefined,
              comment_id: payload.new.comment_id ?? undefined,
              read: payload.new.read,
              sender: {
                id: senderData.id,
                username: senderData.username,
                avatar_url: senderData.avatar_url
              },
              post_content: postContent,
              post_media: postMedia,
              comment_content: commentContent
            };

            setNotifications(prev => [newNotification, ...prev]);
            
            // Reproducir sonido de notificación
            const notificationSound = new Audio("/notification.mp3");
            notificationSound.play().catch(console.error);
            
            toast({
              title: "Nueva notificación",
              description: formatNotificationMessage(payload.new.type, senderData.username),
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleFriendRequest = async (notificationId: string, senderId: string, accept: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('friendships')
        .upsert({
          user_id: user.id,
          friend_id: senderId,
          status: accept ? 'accepted' : 'rejected'
        });

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      toast({
        title: accept ? "Solicitud aceptada" : "Solicitud rechazada",
        description: accept ? "Ahora son amigos" : "Has rechazado la solicitud de amistad",
      });

      loadNotifications();
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la solicitud",
      });
    }
  };

  // Nueva función para marcar notificaciones como leídas
  const markAsRead = async (notificationIds?: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      let query = supabase
        .from('notifications')
        .update({ read: true });

      if (notificationIds && notificationIds.length > 0) {
        // Marcar solo las notificaciones especificadas
        query = query.in('id', notificationIds);
      } else {
        // Marcar todas las notificaciones del usuario
        query = query.eq('receiver_id', user.id);
      }

      await query;
      
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds 
            ? notificationIds.includes(notification.id) 
              ? { ...notification, read: true } 
              : notification
            : { ...notification, read: true }
        )
      );
      
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron marcar las notificaciones como leídas",
      });
    }
  };

  // Nueva función para eliminar todas las notificaciones
  const clearAllNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('receiver_id', user.id);
      
      setNotifications([]);
      
      toast({
        title: "Notificaciones eliminadas",
        description: "Todas las notificaciones han sido eliminadas",
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron eliminar las notificaciones",
      });
    }
  };

  return {
    notifications,
    handleFriendRequest,
    markAsRead,
    clearAllNotifications
  };
};
