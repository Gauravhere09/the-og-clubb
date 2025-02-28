
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
      shared_post_id,
      shared_post_author,
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
    
    // If there are shared posts, fetch the original posts
    const sharedPostIds = data
      ?.filter(post => post.shared_post_id)
      .map(post => post.shared_post_id)
      .filter(Boolean) as string[];
      
    if (sharedPostIds && sharedPostIds.length > 0) {
      // Fetch the original posts
      const { data: sharedPosts, error: sharedError } = await supabase
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
        `)
        .in('id', sharedPostIds);
        
      if (sharedError) throw sharedError;
      
      // Create a map of shared posts by ID for quick lookup
      const sharedPostsMap = (sharedPosts || []).reduce((map, post) => {
        map[post.id] = post;
        return map;
      }, {} as Record<string, any>);
      
      // Add the shared posts to the original data
      data?.forEach(post => {
        if (post.shared_post_id && sharedPostsMap[post.shared_post_id]) {
          post.shared_post = sharedPostsMap[post.shared_post_id];
        }
      });
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching raw posts:', error);
    throw error;
  }
}
