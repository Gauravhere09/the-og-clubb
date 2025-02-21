
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import type { Tables } from "@/types/database.types";

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
                   file.type.startsWith('audio/') || file.type === 'audio/webm' ? 'audio' : null;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        content,
        media_url,
        media_type,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        visibility: 'public'
      } as Tables['posts']['Insert'])
      .select('*, profiles(username, avatar_url)')
      .single();

    if (error) throw error;
    return data as unknown as Post;
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
      reactions:likes(count)
    `);

  if (user?.user) {
    const { data: userReactions } = await supabase
      .from('likes')
      .select('post_id, reaction_type')
      .eq('user_id', user.user.id) as { data: Pick<Tables['likes']['Row'], 'post_id' | 'reaction_type'>[] };

    const userReactionMap = new Map(
      userReactions?.map(reaction => [reaction.post_id, reaction.reaction_type]) || []
    );

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data as unknown as Post[]).map(post => ({
      ...post,
      user_reaction: userReactionMap.get(post.id) || null,
      reactions_count: post.reactions?.[0]?.count || 0,
      reactions: { count: post.reactions?.[0]?.count || 0 },
      comments_count: post.comments?.[0]?.count || 0
    }));
  } else {
    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data as unknown as Post[]).map(post => ({
      ...post,
      reactions_count: post.reactions?.[0]?.count || 0,
      reactions: { count: post.reactions?.[0]?.count || 0 },
      comments_count: post.comments?.[0]?.count || 0
    }));
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
