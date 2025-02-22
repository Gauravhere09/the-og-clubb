
import { supabase } from "@/integrations/supabase/client";
import type { ReactionType } from "@/types/database/social.types";

export async function toggleReaction(postId: string, type: ReactionType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !postId) return null;
  
  const { data: existingReaction, error } = await supabase
    .from('likes')
    .select('*')
    .match({ 
      user_id: user.id,
      post_id: postId
    })
    .single();

  if (error) {
    console.error('Error checking existing reaction:', error);
    return null;
  }

  if (existingReaction) {
    const reaction = existingReaction as unknown as { reaction_type?: ReactionType };
    const existingType = reaction.reaction_type;
    
    if (existingType === type) {
      await supabase
        .from('likes')
        .delete()
        .eq('id', existingReaction.id);
      return null;
    } else {
      await supabase
        .from('likes')
        .update({
          reaction_type: type,
          created_at: new Date().toISOString()
        })
        .eq('id', existingReaction.id);
      return type;
    }
  }

  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  if (post) {
    await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        post_id: postId,
        reaction_type: type,
        read: false
      });

    if (post.user_id !== user.id) {
      await supabase
        .from('notifications')
        .insert({
          type: 'post_like',
          sender_id: user.id,
          receiver_id: post.user_id,
          post_id: postId,
          message: `ha reaccionado a tu publicación con ${type}`,
          read: false,
          created_at: new Date().toISOString()
        });
    }
  }

  return type;
}
