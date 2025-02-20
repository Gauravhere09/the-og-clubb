
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/types/database.types";

type ReactionType = Tables["likes"]["Row"]["reaction_type"];

export async function toggleReaction(postId: string | undefined, reactionType: ReactionType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !postId) return null;
  
  const { data: existingReaction, error: selectError } = await supabase
    .from('likes')
    .select('*')
    .match({ 
      user_id: user.id,
      post_id: postId
    })
    .maybeSingle();

  if (selectError) throw selectError;

  if (existingReaction) {
    if (existingReaction.reaction_type === reactionType) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .match({ id: existingReaction.id });
      if (error) throw error;
      return null;
    } else {
      const { error } = await supabase
        .from('likes')
        .update({ 
          reaction_type: reactionType,
          user_id: user.id,
          post_id: postId 
        })
        .match({ id: existingReaction.id });
      if (error) throw error;
      return reactionType;
    }
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        post_id: postId,
        reaction_type: reactionType,
        comment_id: null
      });
    if (error) throw error;
    return reactionType;
  }
}
