
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/types/database.types";

type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

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
    .maybeSingle() as { data: Tables['likes']['Row'] | null };

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
        .update({ reaction_type: reactionType })
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
        reaction_type: reactionType
      });
    if (error) throw error;
    return reactionType;
  }
}
