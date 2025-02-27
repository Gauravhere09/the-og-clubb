
import { supabase } from "@/integrations/supabase/client";

export async function fetchPostsReactions(postIds: string[]) {
  if (!postIds.length) return [];
  
  try {
    const { data: reactionsData, error } = await supabase
      .from('reactions')
      .select('post_id, reaction_type')
      .in('post_id', postIds);
      
    if (error) return [];
    return reactionsData || [];
  } catch (error) {
    console.error("Error fetching posts reactions:", error);
    return [];
  }
}

export async function fetchUserReactions(userId: string, postIds: string[]) {
  if (!userId || !postIds.length) return {};
  
  try {
    const { data: userReactions, error } = await supabase
      .from('reactions')
      .select('post_id, reaction_type')
      .eq('user_id', userId)
      .in('post_id', postIds);

    if (error || !userReactions) return {};
    
    return userReactions.reduce((acc, reaction) => {
      acc[reaction.post_id] = reaction.reaction_type;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error("Error fetching user reactions:", error);
    return {};
  }
}
