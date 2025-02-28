
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches raw posts data from the database
 */
export async function fetchRawPosts(userId: string | undefined, hasSharedFromColumn: boolean) {
  try {
    // Base query fields that don't depend on shared_from
    const baseSelectFields = `
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
    `;
    
    // Add shared_from to the query if the column exists
    const selectFields = hasSharedFromColumn 
      ? `${baseSelectFields}, shared_from`
      : baseSelectFields;
      
    // Create and execute query
    const query = supabase
      .from('posts')
      .select(selectFields);

    // Add user filter if specified
    if (userId) {
      query.eq('user_id', userId);
    }

    // Execute the query
    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching raw posts:', error);
    throw error;
  }
}
