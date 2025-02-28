
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if specific columns exist in the 'posts' table
 */
export async function checkPostsColumns(): Promise<{
  hasSharedFrom: boolean;
  hasSharedPostId: boolean;
  hasSharedPostAuthor: boolean;
}> {
  const result = {
    hasSharedFrom: false,
    hasSharedPostId: false,
    hasSharedPostAuthor: false
  };

  try {
    // Check basic query first
    const { error: basicQueryError } = await supabase
      .from('posts')
      .select('id')
      .limit(1)
      .maybeSingle();
      
    // If we didn't get an error on the basic query, try specific columns
    if (!basicQueryError) {
      try {
        // Try to check shared_from column
        try {
          // Don't use RPC as it's causing 404 errors
          const { error } = await supabase
            .from('posts')
            .select('shared_from')
            .limit(1);
          result.hasSharedFrom = !error;
        } catch {
          result.hasSharedFrom = false;
        }
        
        // Check shared_post_id column
        try {
          const { error } = await supabase
            .from('posts')
            .select('shared_post_id')
            .limit(1);
          result.hasSharedPostId = !error;
        } catch {
          result.hasSharedPostId = false;
        }
        
        // Check shared_post_author column
        try {
          const { error } = await supabase
            .from('posts')
            .select('shared_post_author')
            .limit(1);
          result.hasSharedPostAuthor = !error;
        } catch {
          result.hasSharedPostAuthor = false;
        }
      } catch (innerError) {
        console.error('Error checking columns:', innerError);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error checking posts columns:', error);
    return result;
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function checkSharedFromColumn(): Promise<boolean> {
  const { hasSharedFrom } = await checkPostsColumns();
  return hasSharedFrom;
}
