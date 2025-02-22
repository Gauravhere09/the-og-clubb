
import { supabase } from "@/integrations/supabase/client";
import { ReactionType } from "@/types/database/social.types";

export { type ReactionType };

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

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking existing reaction:', error);
    return null;
  }

  if (existingReaction) {
    const reaction = existingReaction as unknown as { reaction_type?: ReactionType };
    const existingType = reaction.reaction_type;
    
    if (existingType === type) {
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingReaction.id);
        
      if (deleteError) {
        console.error('Error deleting reaction:', deleteError);
        return null;
      }
      return null;
    } else {
      const { error: updateError } = await supabase
        .from('likes')
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
      .from('likes')
      .insert({
        user_id: user.id,
        post_id: postId,
        reaction_type: type,
      });

    if (insertError) {
      console.error('Error inserting reaction:', insertError);
      return null;
    }

    if (post.user_id !== user.id) {
      const { error: notificationError } = await supabase
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

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    }
  }

  return type;
}
