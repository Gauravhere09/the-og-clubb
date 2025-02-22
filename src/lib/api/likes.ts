
import { supabase } from "@/integrations/supabase/client";
import type { ReactionType, ReactionTable } from "@/types/database/social.types";

export { type ReactionType };

export async function toggleReaction(postId: string, type: ReactionType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !postId) return null;
  
  const { data: existingReaction } = await supabase
    .from('reactions')
    .select()
    .match({ 
      user_id: user.id,
      post_id: postId
    })
    .single() as { data: ReactionTable['Row'] | null };

  if (existingReaction) {
    if (existingReaction.reaction_type === type) {
      const { error: deleteError } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existingReaction.id);
        
      if (deleteError) {
        console.error('Error deleting reaction:', deleteError);
        return null;
      }
      return null;
    } else {
      const { error: updateError } = await supabase
        .from('reactions')
        .update({
          reaction_type: type,
          created_at: new Date().toISOString()
        })
        .eq('id', existingReaction.id);
        
      if (updateError) {
        console.error('Error updating reaction:', updateError);
        return null;
      }
      return type;
    }
  }

  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  if (post) {
    const { error: insertError } = await supabase
      .from('reactions')
      .insert({
        user_id: user.id,
        post_id: postId,
        reaction_type: type,
      } as ReactionTable['Insert']);

    if (insertError) {
      console.error('Error inserting reaction:', insertError);
      return null;
    }

    if (post.user_id !== user.id) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'post_reaction',
          sender_id: user.id,
          receiver_id: post.user_id,
          post_id: postId,
          message: `ha reaccionado a tu publicación con ${type}`,
          read: false,
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    }
  }

  return type;
}
