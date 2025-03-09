
import { supabase } from "@/integrations/supabase/client";

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

export async function hidePost(postId: string) {
  const { error } = await supabase
    .from('hidden_posts')
    .insert({ post_id: postId });
  
  if (error) throw error;
}

export async function unhidePost(postId: string) {
  const { error } = await supabase
    .from('hidden_posts')
    .delete()
    .eq('post_id', postId);
  
  if (error) throw error;
}

export async function getHiddenPosts() {
  const { data, error } = await supabase
    .from('hidden_posts')
    .select('post_id');
  
  if (error) throw error;
  
  return data.map(item => item.post_id);
}
