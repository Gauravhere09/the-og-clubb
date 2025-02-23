
import { supabase } from "@/integrations/supabase/client";
import type { ReactionTable } from "@/types/database/social.types";

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export async function toggleReaction(postId: string, type: ReactionType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión para reaccionar");

  const { data: existingReaction } = await supabase
    .from('reactions')
    .select()
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single<ReactionTable['Row']>();

  if (existingReaction) {
    if (existingReaction.reaction_type === type) {
      // Si el usuario hace clic en la misma reacción, la eliminamos
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existingReaction.id);
      if (error) throw error;
    } else {
      // Si es una reacción diferente, actualizamos el tipo
      const { error } = await supabase
        .from('reactions')
        .update({ reaction_type: type })
        .eq('id', existingReaction.id);
      if (error) throw error;
    }
  } else {
    // Si no existe una reacción previa, creamos una nueva
    const { error } = await supabase
      .from('reactions')
      .insert({
        user_id: user.id,
        post_id: postId,
        reaction_type: type
      });
    if (error) throw error;
  }
}

export async function getPostReactions(postId: string) {
  const { data, error } = await supabase
    .from('reactions')
    .select('reaction_type')
    .eq('post_id', postId);

  if (error) throw error;

  const reactionCounts = data.reduce((acc: Record<string, number>, reaction) => {
    acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
    return acc;
  }, {});

  return {
    total: data.length,
    by_type: reactionCounts
  };
}
