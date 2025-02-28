
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
};

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
    
    if (!data) {
      return [];
    }
    
    // If there are shared posts and the shared_from column exists, fetch the original posts
    let sharedPostIds: string[] = [];
    
    if (hasSharedFromColumn && Array.isArray(data)) {
      // Extract the shared_from IDs from posts that have them
      sharedPostIds = data
        .filter((post): post is any => 
          post !== null && 
          typeof post === 'object' && 
          'shared_from' in post && 
          post.shared_from !== null
        )
        .map(post => post.shared_from as string);
    }
      
    if (sharedPostIds.length > 0) {
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
        if (post && typeof post === 'object' && 'id' in post) {
          map[post.id] = post;
        }
        return map;
      }, {} as Record<string, any>);
      
      // Add the shared posts to the original data
      if (Array.isArray(data)) {
        data.forEach(post => {
          if (post && 
              typeof post === 'object' && 
              hasSharedFromColumn && 
              'shared_from' in post && 
              post.shared_from && 
              sharedPostsMap[post.shared_from]) {
            post.shared_post = sharedPostsMap[post.shared_from];
          }
        });
      }
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching raw posts:', error);
    throw error;
  }
}
