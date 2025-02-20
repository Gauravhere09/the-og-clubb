
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/types/database.types";

type ReactionType = Tables["likes"]["Row"]["reaction_type"];
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
        .update({ 
          reaction_type: reactionType,
          user_id: user.id,
          post_id: postId 
        })
        .eq('id', existingReaction.id);
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
      } satisfies Tables['likes']['Insert']);
    if (error) throw error;
    return reactionType;
  }
}
