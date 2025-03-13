
import { supabase } from "@/integrations/supabase/client";
import { FriendSuggestion } from "@/types/friends";

export async function getFriendSuggestions() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Get the current user's profile for comparing career and semester
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('career, semester')
      .eq('id', user.id)
      .maybeSingle();

    // Get IDs of users who are already friends or have pending requests
    const { data: existingConnections } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id);

    // Add user's own ID to exclude list
    const excludeIds = [
      user.id,
      ...(existingConnections || []).map(c => c.friend_id)
    ].filter(Boolean);

    // Query non-excluded users
    const { data: suggestions, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, career, semester')
      .not('id', 'in', excludeIds.length > 1 ? `(${excludeIds.join(',')})` : `(${user.id})`)
      .limit(20);

    if (error) throw error;

    // Process suggestions with relevance scoring
    return (suggestions || []).map(sugg => {
      // Calculate match factors
      const careerMatch = currentUserProfile?.career && sugg.career && 
                         currentUserProfile.career === sugg.career;
      const semesterMatch = currentUserProfile?.semester && sugg.semester && 
                           currentUserProfile.semester === sugg.semester;
      
      // Calculate relevance score: 2 for career match, 1 for semester match
      const relevanceScore = (careerMatch ? 2 : 0) + (semesterMatch ? 1 : 0);
      
      // For demo purposes - in production this would query actual mutual friends
      const mutual_friends_count = Math.floor(Math.random() * 4); 
      
      return {
        id: sugg.id,
        username: sugg.username || '',
        avatar_url: sugg.avatar_url,
        career: sugg.career,
        semester: sugg.semester,
        careerMatch,
        semesterMatch,
        relevanceScore,
        mutual_friends_count
      };
    }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  } catch (error) {
    console.error('Error getting friend suggestions:', error);
    return [];
  }
}
