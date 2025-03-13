
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

    // Obtenemos sugerencias de usuarios que no son amigos ni tienen solicitudes pendientes
    const { data: suggestions, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(10);

    if (error) throw error;

    // Transformamos los resultados a nuestro formato FriendSuggestion
    const sugestionsWithMutualFriends = await Promise.all((suggestions || []).map(async (sugg) => {
      // Aquí podríamos implementar la lógica para detectar amigos en común
      // Por simplicidad, usamos un número aleatorio entre 0 y 5
      const mutual_friends_count = Math.floor(Math.random() * 6);
      
      return {
        id: sugg.id,
        username: sugg.username || '',
        avatar_url: sugg.avatar_url,
        mutual_friends_count
      };
    }));

    return sugestionsWithMutualFriends;
  } catch (error: any) {
    console.error('Error getting friend suggestions:', error);
    return [];
  }
}
