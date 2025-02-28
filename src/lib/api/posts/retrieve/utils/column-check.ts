
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
    // Check shared_from column
    const { error: sharedFromError } = await supabase
      .from('posts')
      .select('shared_from')
      .limit(1);
      
    result.hasSharedFrom = !sharedFromError;
    
    // Check shared_post_id column
    const { error: sharedPostIdError } = await supabase
      .from('posts')
      .select('shared_post_id')
      .limit(1);
      
    result.hasSharedPostId = !sharedPostIdError;
    
    // Check shared_post_author column
    const { error: sharedPostAuthorError } = await supabase
      .from('posts')
      .select('shared_post_author')
      .limit(1);
      
    result.hasSharedPostId = !sharedPostAuthorError;
    
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
