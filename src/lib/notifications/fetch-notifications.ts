
import { supabase } from "@/integrations/supabase/client";
import type { NotificationType, NotificationWithSender } from "@/types/notifications";

export async function fetchNotifications(): Promise<NotificationWithSender[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // First, check if the table and columns exist to avoid SQL errors
    const { data: tableInfo, error: tableError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('Error checking notifications table:', tableError);
      return [];
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
        sender_id,
        receiver_id
      `)
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading notifications:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get all unique sender IDs
    const senderIds = [...new Set(data.map(item => item.sender_id))];
    
    // Fetch sender profiles in a separate query
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', senderIds);
      
    if (profilesError) {
      console.error('Error loading sender profiles:', profilesError);
      return [];
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
    
    // Process notifications with sender and post data
    return data.map((notification) => {
      // Find the profile for this notification's sender
      const senderProfile = profileMap.get(notification.sender_id) || {
        id: notification.sender_id,
        username: 'Usuario',
        avatar_url: null
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
        sender_id: senderProfile.id,
        receiver_id: notification.receiver_id,
        sender: {
          id: senderProfile.id,
          username: senderProfile.username,
          avatar_url: senderProfile.avatar_url,
          full_name: undefined // We don't have full_name in the profiles table
        },
        post_content: postContent,
        post_media: postMedia,
        comment_content: commentContent
      };
    });
  } catch (error) {
    console.error('Error in fetchNotifications:', error);
    return [];
  }
}
