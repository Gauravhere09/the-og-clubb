
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { Tables } from "@/types/database";

export async function createPost(content: string, file: File | null = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    let media_url = null;
    let media_type = null;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      media_url = publicUrl;
      media_type = file.type.startsWith('image/') ? 'image' :
                   file.type.startsWith('video/') ? 'video' :
                   file.type.startsWith('audio/') || file.type === 'audio/webm' ? 'audio' : null;
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        content,
        media_url,
        media_type,
        user_id: user.id,
        visibility: 'public'
      } as Tables['posts']['Insert'])
      .select('*, profiles(username, avatar_url)')
      .single();

    if (error) throw error;

    // Notificar a los amigos sobre la nueva publicación
    const { data: friends } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', user.id);

    if (friends && friends.length > 0) {
      const notifications = friends.map(friend => ({
        type: 'new_post' as const,
        sender_id: user.id,
        receiver_id: friend.friend_id,
        post_id: post.id
      }));

      await supabase
        .from('notifications')
        .insert(notifications);
    }

    return post as unknown as Post;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function getPosts() {
  const { data: user } = await supabase.auth.getUser();
  
  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles(username, avatar_url),
      comments:comments(count),
      likes:likes(id, user_id)
    `);

  if (user?.user) {
    const { data: userLikes } = await supabase
      .from('likes')
      .select('id, post_id')
      .eq('user_id', user.user.id);

    const userLikesMap = new Map(
      userLikes?.map(like => [like.post_id, 'like']) || []
    );

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((post: any) => {
      const likes = post.likes || [];

      return {
        ...post,
        user_reaction: userLikesMap.get(post.id) || null,
        reactions_count: likes.length,
        reactions: {
          count: likes.length,
          by_type: { 'like': likes.length }
        },
        comments_count: post.comments?.[0]?.count || 0
      } as Post;
    });
  } else {
    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((post: any) => {
      const likes = post.likes || [];

      return {
        ...post,
        reactions_count: likes.length,
        reactions: {
          count: likes.length,
          by_type: { 'like': likes.length }
        },
        comments_count: post.comments?.[0]?.count || 0
      } as Post;
    });
  }
}

export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}

export async function updatePostVisibility(postId: string, visibility: 'public' | 'friends' | 'private') {
  const { error } = await supabase
    .from('posts')
    .update({ visibility })
    .eq('id', postId);

  if (error) throw error;
}
