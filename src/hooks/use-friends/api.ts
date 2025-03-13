
import { supabase } from "@/integrations/supabase/client";
import type { Friend, FriendRequest, FriendSuggestion } from "@/types/friends";
import type { Tables } from "@/types/database";

interface FriendshipWithProfile {
  id: string;
  friend: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

interface FriendRequestWithProfile {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  user: {
    username: string | null;
    avatar_url: string | null;
  };
}

export async function getFriendsData(userId: string) {
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select(`
      id,
      friend:profiles!friendships_friend_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'accepted')
    .returns<FriendshipWithProfile[]>();

  const { data: requests, error: requestsError } = await supabase
    .from('friendships')
    .select(`
      id,
      user_id,
      friend_id,
      status,
      created_at,
      user:profiles!friendships_user_id_fkey (
        username,
        avatar_url
      )
    `)
    .eq('friend_id', userId)
    .eq('status', 'pending')
    .returns<FriendRequestWithProfile[]>();

  if (friendshipsError) throw friendshipsError;
  if (requestsError) throw requestsError;

  const friends: Friend[] = (friendships || []).map(f => ({
    friend_id: f.friend.id,
    friend_username: f.friend.username || '',
    friend_avatar_url: f.friend.avatar_url
  }));

  const friendRequests: FriendRequest[] = (requests || []).map(r => ({
    id: r.id,
    user_id: r.user_id,
    friend_id: r.friend_id,
    status: 'pending',
    created_at: r.created_at,
    user: {
      username: r.user.username || '',
      avatar_url: r.user.avatar_url || null
    }
  }));

  return { friends, friendRequests };
}

export async function getFriendSuggestions(userId: string): Promise<FriendSuggestion[]> {
  // First get the user's profile to compare with
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('career, semester')
    .eq('id', userId)
    .single();

  const { data: suggestions, error: suggestionsError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, career, semester')
    .neq('id', userId)
    .limit(5);

  if (suggestionsError) throw suggestionsError;

  return (suggestions || []).map(s => {
    // Check for career and semester matches
    const careerMatch = userProfile?.career && s.career && 
                       userProfile.career === s.career;
    const semesterMatch = userProfile?.semester && s.semester && 
                          userProfile.semester === s.semester;
    
    // Calculate relevance score (2 points for career match, 1 for semester)
    const relevanceScore = (careerMatch ? 2 : 0) + (semesterMatch ? 1 : 0);
    
    return {
      id: s.id,
      username: s.username || '',
      avatar_url: s.avatar_url,
      career: s.career,
      semester: s.semester,
      careerMatch,
      semesterMatch,
      relevanceScore,
      mutual_friends_count: Math.floor(Math.random() * 3) // Placeholder for demo
    };
  }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}
