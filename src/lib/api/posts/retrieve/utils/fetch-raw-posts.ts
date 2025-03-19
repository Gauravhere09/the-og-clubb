
import { supabase } from "@/integrations/supabase/client";

type PostData = {
  id: string;
  content: string | null;
  user_id: string;
  media_url: string | null;
  media_type: string | null;
  visibility: 'public' | 'friends' | 'private';
  poll: any;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  };
  shared_from?: string | null;
  shared_post?: any;
  shared_post_id?: string | null;
  shared_post_author?: string | null;
};

/**
 * Fetches raw posts data from the database
 */
export async function fetchRawPosts(userId: string | undefined, hasSharedFromColumn: boolean) {
  try {
    // Since we know shared_from doesn't exist, always use the basic select fields
    const selectFields = `
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
    
    // Create and execute query
    const query = supabase
      .from('posts')
      .select(selectFields);

    // Add user filter if specified
    if (userId) {
      // Si estamos viendo un perfil, excluir las publicaciones incógnito
      query.eq('user_id', userId)
           .neq('visibility', 'private'); // excluye publicaciones incógnito en perfiles
    }

    // Execute the query
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data) {
      return [];
    }
    
    // Skip shared posts processing since we know the columns don't exist
    return data || [];
  } catch (error) {
    console.error('Error fetching raw posts:', error);
    throw error;
  }
}
