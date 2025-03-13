
import { supabase } from "@/integrations/supabase/client";
import { FriendSuggestion } from "./types";

export async function getFriendSuggestions() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Obtenemos los IDs de los usuarios que ya son amigos o tienen solicitudes pendientes
    const { data: existingConnections } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id);

    const excludeIds = [
      user.id,
      ...(existingConnections || []).map(c => c.friend_id)
    ].filter(Boolean);

    // Primero obtenemos los datos del usuario actual para comparar carrera y semestre
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('career, semester')
      .eq('id', user.id)
      .single();

    // Obtenemos sugerencias de usuarios que no son amigos ni tienen solicitudes pendientes
    const { data: suggestions, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, career, semester')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(20);

    if (error) throw error;

    // Transformamos los resultados a nuestro formato FriendSuggestion
    const sugestionsWithMutualFriends = await Promise.all((suggestions || []).map(async (sugg) => {
      // Calculamos coincidencias de carrera y semestre
      const careerMatch = currentUserProfile?.career && sugg.career && 
                          currentUserProfile.career === sugg.career;
      const semesterMatch = currentUserProfile?.semester && sugg.semester && 
                           currentUserProfile.semester === sugg.semester;
      
      // Calculamos un nivel de relevancia basado en coincidencias
      // 2 puntos por coincidencia exacta de carrera, 1 punto por semestre
      const relevanceScore = (careerMatch ? 2 : 0) + (semesterMatch ? 1 : 0);
      
      // Obtener amigos en común (para futura implementación)
      const mutual_friends_count = Math.floor(Math.random() * 6);
      
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
    }));

    // Ordenamos por relevancia (primero las coincidencias de carrera y semestre)
    return sugestionsWithMutualFriends.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error: any) {
    console.error('Error getting friend suggestions:', error);
    return [];
  }
}
