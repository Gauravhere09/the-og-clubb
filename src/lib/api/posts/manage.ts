
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
  // Obtener el usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Usuario no autenticado');
  
  // Verificar si la publicación ya está oculta para evitar conflictos
  const { data: existingHiddenPost } = await supabase
    .from('hidden_posts')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();
  
  // Si ya está oculta, no hacer nada
  if (existingHiddenPost) {
    return;
  }
  
  // Si no está oculta, ocultarla
  const { error } = await supabase
    .from('hidden_posts')
    .insert({ 
      post_id: postId,
      user_id: user.id
    });
  
  if (error) throw error;
}

export async function unhidePost(postId: string) {
  // Obtener el usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Usuario no autenticado');
  
  const { error } = await supabase
    .from('hidden_posts')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);
  
  if (error) throw error;
}

export async function getHiddenPosts() {
  // Obtener el usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return []; // Si no hay usuario autenticado, devolver array vacío
  
  const { data, error } = await supabase
    .from('hidden_posts')
    .select('post_id')
    .eq('user_id', user.id);
  
  if (error) throw error;
  
  return data.map(item => item.post_id);
}
