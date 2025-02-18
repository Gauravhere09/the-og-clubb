
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
      comments(count),
      likes(count),
      likes!inner(id).count(id)
    `)
    .order('created_at', { ascending: false });

  if (user?.user) {
    query = query.select(`
      *,
      profiles(username, avatar_url),
      comments(count),
      likes(count),
      likes!inner(id).count(id),
      likes!inner(user_id).eq(user_id, ${user.user.id})
    `);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Post[];
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
      likes(count)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (user?.user) {
    query = query.select(`
      *,
      profiles(username, avatar_url),
      likes(count),
      likes!inner(user_id).eq(user_id, ${user.user.id})
    `);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Organizar comentarios en estructura jerárquica
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

export async function toggleLike(postId?: string, commentId?: string) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  const { data: existingLike } = await supabase
    .from('likes')
    .select()
    .match({ 
      user_id: userId,
      ...(postId ? { post_id: postId } : { comment_id: commentId })
    })
    .single();

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
