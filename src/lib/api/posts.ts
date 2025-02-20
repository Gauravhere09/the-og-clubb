
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";

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
