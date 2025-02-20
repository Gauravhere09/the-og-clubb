
import { supabase } from "@/integrations/supabase/client";

type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export async function toggleReaction(postId: string | undefined, reactionType: ReactionType) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  const { data: existingReaction } = await supabase
    .from('likes')
    .select()
    .match({ 
      user_id: userId,
      post_id: postId
    })
    .maybeSingle();

  if (existingReaction) {
    if (existingReaction.reaction_type === reactionType) {
      // Si la reacción es la misma, la eliminamos
      const { error } = await supabase
        .from('likes')
        .delete()
        .match({ id: existingReaction.id });
      if (error) throw error;
      return null;
    } else {
      // Si es una reacción diferente, actualizamos el tipo
      const { error } = await supabase
        .from('likes')
        .update({ reaction_type: reactionType })
        .match({ id: existingReaction.id });
      if (error) throw error;
      return reactionType;
    }
  } else {
    // Si no existe reacción previa, creamos una nueva
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        post_id: postId,
        reaction_type: reactionType
      });
    if (error) throw error;
    return reactionType;
  }
}
