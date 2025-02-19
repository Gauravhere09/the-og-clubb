import { supabase } from "@/integrations/supabase/client";
import { Post, Comment } from "@/types/post";

export async function createPost(content: string, file: File | null = null) {
  try {
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
                   file.type.startsWith('audio/') ? 'audio' : null;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        content,
        media_url,
        media_type,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select('*, profiles(username, avatar_url)')
      .single();

    if (error) throw error;
    return data;
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
      likes:likes(count)
    `);

  if (user?.user) {
    const { data: userLikes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', user.user.id);

    const likedPostIds = new Set(userLikes?.map(like => like.post_id) || []);

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data as Post[]).map(post => ({
      ...post,
      user_has_liked: likedPostIds.has(post.id)
    }));
  } else {
    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Post[];
  }
}

export async function createComment(postId: string, content: string, parentId?: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      content,
      parent_id: parentId,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select('*, profiles(username, avatar_url)')
    .single();

  if (error) throw error;
  return data;
}

export async function getComments(postId: string) {
  const { data: user } = await supabase.auth.getUser();
  
  let query = supabase
    .from('comments')
    .select(`
      *,
      profiles(username, avatar_url),
      likes:likes(count)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (user?.user) {
    const { data: userLikes } = await supabase
      .from('likes')
      .select('comment_id')
      .eq('user_id', user.user.id);

    const likedCommentIds = new Set(userLikes?.map(like => like.comment_id) || []);

    const { data, error } = await query;

    if (error) throw error;

    const comments = (data as Comment[]).map(comment => ({
      ...comment,
      user_has_liked: likedCommentIds.has(comment.id)
    }));

    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies?.push(commentMap.get(comment.id)!);
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    return rootComments;
  } else {
    const { data, error } = await query;

    if (error) throw error;

    const comments = data as Comment[];
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies?.push(commentMap.get(comment.id)!);
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    return rootComments;
  }
}

export async function toggleLike(postId?: string, commentId?: string) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  const { data: existingLike } = await supabase
    .from('likes')
    .select()
    .match({ 
      user_id: userId,
      ...(postId ? { post_id: postId } : { comment_id: commentId })
    })
    .maybeSingle();

  if (existingLike) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .match({ id: existingLike.id });
    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        ...(postId ? { post_id: postId } : { comment_id: commentId })
      });
    if (error) throw error;
    return true;
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

export async function sendFriendRequest(targetUserId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (!profile) throw new Error("Usuario no encontrado");

    const { data, error } = await supabase.rpc('create_friendship', {
      target_user_id: targetUserId
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    throw error;
  }
}

export async function acceptFriendRequest(senderId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { error } = await supabase.rpc('accept_friendship', {
      sender_id: senderId
    });

    if (error) throw error;
  } catch (error: any) {
    throw error;
  }
}

export async function rejectFriendRequest(senderId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { error } = await supabase.rpc('reject_friendship', {
      sender_id: senderId
    });

    if (error) throw error;
  } catch (error: any) {
    throw error;
  }
}

export async function getFriendRequests() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data, error } = await supabase.rpc('get_friend_requests');

    if (error) throw error;
    return data;
  } catch (error: any) {
    throw error;
  }
}

export async function getFriends() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data, error } = await supabase.rpc('get_friends');

    if (error) throw error;
    return data;
  } catch (error: any) {
    throw error;
  }
}

export async function checkFriendship(targetUserId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data, error } = await supabase.rpc('check_friendship_status', {
      target_user_id: targetUserId
    });

    if (error && error.code !== 'PGRST116') return null;
    return data;
  } catch (error: any) {
    return null;
  }
}
