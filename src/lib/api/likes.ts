
import { supabase } from "@/integrations/supabase/client";

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
