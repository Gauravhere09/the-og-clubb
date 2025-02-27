
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches raw posts data from the database
 */
export async function fetchRawPosts(userId: string | undefined, hasSharedFromColumn: boolean) {
  try {
    // Determine query based on shared_from column existence
    if (hasSharedFromColumn) {
      // Query with shared_from
      const query = supabase
        .from('posts')
        .select(`
          id,
          content,
          user_id,
          media_url,
          media_type,
          visibility,
          poll,
          created_at,
          updated_at,
          shared_from,
          profiles (
            username,
            avatar_url
          )
        `);

      if (userId) {
        query.eq('user_id', userId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } else {
      // Query without shared_from
      const query = supabase
        .from('posts')
        .select(`
          id,
          content,
          user_id,
          media_url,
          media_type,
          visibility,
          poll,
          created_at,
          updated_at,
          profiles (
            username,
            avatar_url
          )
        `);

      if (userId) {
        query.eq('user_id', userId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  } catch (error) {
    console.error('Error fetching raw posts:', error);
    throw error;
  }
}
