
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if the 'shared_from' column exists in the 'posts' table
 */
export async function checkSharedFromColumn(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('shared_from')
      .limit(1);
      
    if (error) {
      // If there's an error mentioning "column does not exist", return false
      if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('shared_from column does not exist in the posts table');
        return false;
      }
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking shared_from column:', error);
    return false;
  }
}
