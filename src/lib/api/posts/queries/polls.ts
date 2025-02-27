
import { supabase } from "@/integrations/supabase/client";

export async function fetchUserPollVotes(userId: string) {
  if (!userId) return {};
  
  try {
    const { data: votesData, error } = await supabase
      .from('poll_votes')
      .select('post_id, option_id')
      .eq('user_id', userId);

    if (error || !votesData) return {};
    
    return votesData.reduce((acc, vote) => {
      acc[vote.post_id] = vote.option_id;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error("Error fetching user poll votes:", error);
    return {};
  }
}
