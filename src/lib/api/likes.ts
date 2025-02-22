
import { supabase } from "@/integrations/supabase/client";
import type { ReactionType } from "@/types/database/social.types";

export async function toggleReaction(postId: string | undefined, reactionType: ReactionType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !postId) return null;
  
  const { data: existingReaction } = await supabase
    .from('likes')
    .select('*')
    .match({ 
      user_id: user.id,
      post_id: postId
    })
    .single();

  if (existingReaction) {
    if (existingReaction.reaction_type === reactionType) {
      await supabase
        .from('likes')
        .delete()
        .eq('id', existingReaction.id);
      return null;
    } else {
      await supabase
        .from('likes')
        .update({
          reaction_type: reactionType,
          created_at: new Date().toISOString()
        })
        .eq('id', existingReaction.id);
      return reactionType;
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
        reaction_type: reactionType,
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
          message: `ha reaccionado a tu publicación con ${reactionType}`,
          read: false
        });
    }
  }

  return reactionType;
}
