
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/types/database";

export type ReactionType = 'like' | 'love' | 'haha' | 'angry' | 'surprised' | 'sigma';
type Like = Tables["likes"]["Row"];

export async function toggleReaction(postId: string | undefined, reactionType: ReactionType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !postId) return null;
  
  const { data: existingReaction, error: selectError } = await supabase
    .from('likes')
    .select('id, user_id, post_id, comment_id, reaction_type, created_at')
    .match({ 
      user_id: user.id,
      post_id: postId
    })
    .maybeSingle<Like>();

  if (selectError) throw selectError;

  if (existingReaction) {
    if (existingReaction.reaction_type === reactionType) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingReaction.id);
      if (error) throw error;
      return null;
    } else {
      const { error } = await supabase
        .from('likes')
        .update({ reaction_type: reactionType })
        .eq('id', existingReaction.id);
      if (error) throw error;
      return reactionType;
    }
  } else {
    // Get post owner ID and username
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        post_id: postId,
        reaction_type: reactionType
      });

    if (error) throw error;

    // Create notification for post owner
    if (post && post.user_id !== user.id) {
      await supabase
        .from('notifications')
        .insert({
          type: 'post_like',
          sender_id: user.id,
          receiver_id: post.user_id,
          post_id: postId,
          message: `Ha reaccionado a tu publicación con ${reactionType}`
        });
    }

    return reactionType;
  }
}
