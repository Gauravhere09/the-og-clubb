
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
  try {
    // Primero obtenemos el perfil del usuario para comparar
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('career, semester')
      .eq('id', userId)
      .maybeSingle();

    // Obtenemos IDs de amigos existentes para excluirlos
    const { data: existingFriends } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', userId);

    const excludeIds = [
      userId,
      ...(existingFriends || []).map(f => f.friend_id)
    ].filter(Boolean);

    // Obtenemos sugerencias
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, career, semester')
      .not('id', 'in', excludeIds.length > 1 ? `(${excludeIds.join(',')})` : `(${userId})`)
      .limit(10);

    if (suggestionsError) throw suggestionsError;

    // Procesamos las sugerencias con coincidencias
    return (suggestions || []).map(s => {
      // Comprobamos coincidencias
      const careerMatch = userProfile?.career && s.career && 
                         userProfile.career === s.career;
      const semesterMatch = userProfile?.semester && s.semester && 
                            userProfile.semester === s.semester;
      
      // Calculamos puntuación de relevancia
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
        mutual_friends_count: Math.floor(Math.random() * 3) // Placeholder para demostración
      };
    }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  } catch (error) {
    console.error('Error obteniendo sugerencias de amigos:', error);
    return [];
  }
}
